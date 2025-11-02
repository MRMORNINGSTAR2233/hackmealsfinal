#!/usr/bin/env node

// Import CSV data to Supabase
require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
}

async function importCSVData() {
  try {
    console.log('📂 Reading CSV file...');
    
    // Read the CSV file
    const csvContent = fs.readFileSync('../TEAM_DETAILS_DOCUMENT_with_headers.csv', 'utf8');
    const data = parseCSV(csvContent);
    
    console.log(`📊 Found ${data.length} rows in CSV file (including header)`);
    
    if (data.length < 2) {
      console.log('❌ No data found in CSV file');
      return;
    }
    
    // Get headers and data
    const headers = data[0];
    const rows = data.slice(1);
    
    console.log('📋 Headers:', headers);
    console.log('📋 Sample row:', rows[0]);
    
    // Transform data to match our database schema
    const participants = [];
    const seenParticipants = new Set();
    
    rows.forEach((row, index) => {
      const [teamNo, teamName, participantName, organization] = row;
      
      // Skip empty rows
      if (!participantName || !teamName) return;
      
      // Create a unique identifier for deduplication
      const participantKey = `${teamName.toLowerCase()}-${participantName.toLowerCase()}`;
      
      if (!seenParticipants.has(participantKey)) {
        seenParticipants.add(participantKey);
        
        participants.push({
          name: participantName.trim(),
          email: null,
          mobile: `PARTICIPANT${String(participants.length + 1).padStart(3, '0')}`, // Unique identifier
          team_name: teamName.trim(),
          qr_code: `HACK-${Date.now()}-${participants.length}-${Math.random().toString(36).substr(2, 9)}`,
          breakfast: false,
          lunch: false,
          dinner: false
        });
      }
    });
    
    console.log(`✅ Processed ${participants.length} valid participants`);
    
    if (participants.length === 0) {
      console.log('❌ No valid participants found. Please check CSV file format.');
      return;
    }
    
    // Show sample of processed data
    console.log('📋 Sample processed participant:', JSON.stringify(participants[0], null, 2));
    if (participants.length > 1) {
      console.log('📋 Sample processed participant:', JSON.stringify(participants[1], null, 2));
    }
    
    // Check for existing participants to avoid duplicates
    console.log('🔍 Checking for existing participants...');
    const { data: existingParticipants, error: fetchError } = await supabase
      .from('participants')
      .select('mobile');
    
    if (fetchError) {
      console.error('❌ Error fetching existing participants:', fetchError.message);
      console.log('💡 Make sure you have run the SQL schema in Supabase first!');
      return;
    }
    
    const existingMobiles = new Set((existingParticipants || []).map(p => p.mobile.toLowerCase()));
    const newParticipants = participants.filter(p => !existingMobiles.has(p.mobile.toLowerCase()));
    
    console.log(`📱 Found ${existingParticipants?.length || 0} existing participants`);
    console.log(`➕ Will add ${newParticipants.length} new participants`);
    console.log(`⚠️  Skipping ${participants.length - newParticipants.length} duplicates`);
    
    if (newParticipants.length === 0) {
      console.log('✅ All participants already exist in database');
      return;
    }
    
    // Insert new participants
    console.log('💾 Inserting participants into database...');
    const { data: insertedData, error: insertError } = await supabase
      .from('participants')
      .insert(newParticipants)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting participants:', insertError.message);
      return;
    }
    
    console.log('🎉 Successfully imported participants!');
    console.log(`✅ Added ${insertedData?.length || 0} participants to database`);
    
    // Show summary
    const { data: totalParticipants, error: countError } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📊 Total participants in database: ${totalParticipants?.length || 'Unknown'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the import
importCSVData();