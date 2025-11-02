#!/usr/bin/env node

// Test participant QR code functionality
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testParticipantQR() {
  try {
    console.log('🧪 Testing Participant QR Code Functionality');
    console.log('============================================');
    
    // Test 1: Get sample participants
    console.log('\n1️⃣ Fetching sample participants...');
    const { data: participants, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching participants:', fetchError.message);
      return;
    }
    
    if (!participants || participants.length === 0) {
      console.log('❌ No participants found in database');
      return;
    }
    
    console.log(`✅ Found ${participants.length} sample participants`);
    
    // Display sample participants
    participants.forEach((p, index) => {
      console.log(`\n📝 Participant ${index + 1}:`);
      console.log(`   Name: ${p.name}`);
      console.log(`   Team: ${p.team_name}`);
      console.log(`   ID: ${p.mobile}`);
      console.log(`   QR Code: ${p.qr_code}`);
      console.log(`   Meals: B:${p.breakfast} L:${p.lunch} D:${p.dinner}`);
    });
    
    // Test 2: Test participant verification (like login)
    console.log('\n2️⃣ Testing participant login functionality...');
    const testParticipant = participants[0];
    
    const { data: verifyResult, error: verifyError } = await supabase
      .from('participants')
      .select('*')
      .ilike('name', testParticipant.name)
      .ilike('team_name', testParticipant.team_name)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying participant:', verifyError.message);
    } else {
      console.log('✅ Participant login verification works!');
      console.log(`   Found: ${verifyResult.name} from ${verifyResult.team_name}`);
    }
    
    // Test 3: Test QR code lookup
    console.log('\n3️⃣ Testing QR code lookup...');
    const { data: qrResult, error: qrError } = await supabase
      .from('participants')
      .select('*')
      .eq('qr_code', testParticipant.qr_code)
      .single();
    
    if (qrError) {
      console.error('❌ Error looking up QR code:', qrError.message);
    } else {
      console.log('✅ QR code lookup works!');
      console.log(`   QR: ${qrResult.qr_code} → ${qrResult.name}`);
    }
    
    // Test 4: Test meal status update
    console.log('\n4️⃣ Testing meal status update...');
    const { error: updateError } = await supabase
      .from('participants')
      .update({ breakfast: true })
      .eq('id', testParticipant.id);
    
    if (updateError) {
      console.error('❌ Error updating meal status:', updateError.message);
    } else {
      console.log('✅ Meal status update works!');
      
      // Verify the update
      const { data: updatedParticipant } = await supabase
        .from('participants')
        .select('breakfast')
        .eq('id', testParticipant.id)
        .single();
      
      console.log(`   Breakfast status: ${updatedParticipant?.breakfast}`);
      
      // Reset for next test
      await supabase
        .from('participants')
        .update({ breakfast: false })
        .eq('id', testParticipant.id);
    }
    
    // Test 5: Show login instructions
    console.log('\n5️⃣ Test Login Instructions:');
    console.log('============================');
    console.log('🌐 Open: http://localhost:8080/participant/login');
    console.log('📝 Test with any of these participants:');
    
    participants.slice(0, 3).forEach((p, index) => {
      console.log(`\n   Option ${index + 1}:`);
      console.log(`   Name: "${p.name}"`);
      console.log(`   Team Name: "${p.team_name}"`);
    });
    
    console.log('\n6️⃣ QR Code Testing:');
    console.log('===================');
    console.log('📱 After logging in as a participant:');
    console.log('   1. You should see their unique QR code');
    console.log('   2. Download the QR code as PNG');
    console.log('   3. Test scanning with admin portal:');
    console.log('      http://localhost:8080/admin/login');
    console.log('      (admin / admin123)');
    
    // Test 6: Get statistics
    console.log('\n7️⃣ Current Statistics:');
    console.log('======================');
    const { data: allParticipants } = await supabase
      .from('participants')
      .select('breakfast, lunch, dinner');
    
    if (allParticipants) {
      const stats = {
        total: allParticipants.length,
        breakfast: allParticipants.filter(p => p.breakfast).length,
        lunch: allParticipants.filter(p => p.lunch).length,
        dinner: allParticipants.filter(p => p.dinner).length,
      };
      
      console.log(`   Total Participants: ${stats.total}`);
      console.log(`   Breakfast Served: ${stats.breakfast}`);
      console.log(`   Lunch Served: ${stats.lunch}`);
      console.log(`   Dinner Served: ${stats.dinner}`);
    }
    
    console.log('\n🎉 All QR Code functionality tests completed!');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run the tests
testParticipantQR();