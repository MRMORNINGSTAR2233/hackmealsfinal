#!/usr/bin/env node

// Import Excel data to Supabase
require('dotenv').config();
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importExcelData() {
  try {
    console.log('📂 Reading Excel file...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('../TEAM_DETAILS_DOCUMENT.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${data.length} rows in Excel file`);
    console.log('📋 Sample data:', JSON.stringify(data[0], null, 2));
    
    if (data.length === 0) {
      console.log('❌ No data found in Excel file');
      return;
    }
    
    // Transform data to match our database schema
    console.log('🔍 Available columns:', Object.keys(data[0]));
    
    // Deduplicate based on team name and participant name
    const uniqueParticipants = [];
    const seenParticipants = new Set();
    
    const participants = data.map((row, index) => {
      const values = Object.values(row).filter(v => v && String(v).trim());
      
      if (values.length >= 2) {
        let teamName = String(values[0]).trim();
        let name = String(values[1]).trim();
        
        // Skip rows that start with numbers (seems to be index rows)
        if (values[0] === '1' || values[0] === 1) {
          if (values.length >= 3) {
            teamName = String(values[1]).trim();
            name = String(values[2]).trim();
          }
        }
        
        // Create a unique identifier for deduplication
        const participantKey = `${teamName.toLowerCase()}-${name.toLowerCase()}`;
        
        if (!seenParticipants.has(participantKey) && name && teamName) {
          seenParticipants.add(participantKey);
          
          const participantIndex = uniqueParticipants.length;
          
          return {
            // Let PostgreSQL generate the UUID automatically
            name: name,
            email: null,
            mobile: `PARTICIPANT${String(participantIndex + 1).padStart(3, '0')}`, // Unique participant identifier
            team_name: teamName,
            qr_code: `HACK-${Date.now()}-${participantIndex}-${Math.random().toString(36).substr(2, 9)}`,
            breakfast: false,
            lunch: false,
            dinner: false
          };
        }
      }
      return null;
    }).filter(p => p !== null);
    
    // Remove duplicates
    uniqueParticipants.push(...participants);
    
    console.log(`✅ Processed ${uniqueParticipants.length} valid participants`);
    
    if (uniqueParticipants.length === 0) {
      console.log('❌ No valid participants found. Please check Excel file format.');
      return;
    }
    
    // Show sample of processed data
    console.log('� Sample processed participant:', JSON.stringify(uniqueParticipants[0], null, 2));
    console.log('📋 Sample processed participant:', JSON.stringify(uniqueParticipants[1], null, 2));
    
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
    const newParticipants = uniqueParticipants.filter(p => !existingMobiles.has(p.mobile.toLowerCase()));
    
    console.log(`📱 Found ${existingParticipants?.length || 0} existing participants`);
    console.log(`➕ Will add ${newParticipants.length} new participants`);
    console.log(`⚠️  Skipping ${uniqueParticipants.length - newParticipants.length} duplicates`);
    
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
importExcelData();