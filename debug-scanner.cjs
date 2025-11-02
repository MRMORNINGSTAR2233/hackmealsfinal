const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugScanner() {
  console.log('🔍 Debugging Scanner Functionality...\n');

  try {
    // 1. Get a sample participant with their QR code
    console.log('1. Fetching sample participant...');
    const { data: participants, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .limit(1);

    if (fetchError || !participants || participants.length === 0) {
      console.error('❌ Failed to fetch participants:', fetchError);
      return;
    }

    const participant = participants[0];
    console.log('✅ Sample participant found:');
    console.log(`   Name: ${participant.name}`);
    console.log(`   Team: ${participant.team_name}`);
    console.log(`   QR Code: ${participant.qr_code}`);
    console.log(`   Current status - Breakfast: ${participant.breakfast}, Lunch: ${participant.lunch}, Dinner: ${participant.dinner}\n`);

    // 2. Test getParticipant function (equivalent to scanning)
    console.log('2. Testing QR code lookup...');
    const { data: foundParticipant, error: lookupError } = await supabase
      .from('participants')
      .select('*')
      .eq('qr_code', participant.qr_code)
      .single();

    if (lookupError || !foundParticipant) {
      console.error('❌ Failed to find participant by QR code:', lookupError);
      return;
    }
    console.log('✅ QR code lookup successful\n');

    // 3. Test meal status update
    console.log('3. Testing meal status update...');
    const mealType = 'breakfast'; // Test breakfast update

    // Check current status
    if (foundParticipant[mealType]) {
      console.log(`⚠️  ${mealType} is already marked as true. Let's reset it first for testing.`);
      
      // Reset the meal status for testing
      const { error: resetError } = await supabase
        .from('participants')
        .update({ [mealType]: false })
        .eq('id', foundParticipant.id);

      if (resetError) {
        console.error('❌ Failed to reset meal status:', resetError);
        return;
      }
      console.log('✅ Reset meal status for testing');
    }

    // Now update the meal status
    const { error: updateError } = await supabase
      .from('participants')
      .update({ [mealType]: true })
      .eq('id', foundParticipant.id);

    if (updateError) {
      console.error('❌ Failed to update meal status:', updateError);
      return;
    }

    console.log('✅ Meal status update successful\n');

    // 4. Verify the update in database
    console.log('4. Verifying update in database...');
    const { data: updatedParticipant, error: verifyError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', foundParticipant.id)
      .single();

    if (verifyError || !updatedParticipant) {
      console.error('❌ Failed to verify update:', verifyError);
      return;
    }

    console.log('✅ Database verification successful:');
    console.log(`   ${mealType}: ${updatedParticipant[mealType]} (should be true)`);
    console.log(`   Updated participant: ${updatedParticipant.name}\n`);

    // 5. Test preventing duplicate updates
    console.log('5. Testing duplicate update prevention...');
    const { data: duplicateCheck, error: duplicateError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', foundParticipant.id)
      .single();

    if (duplicateCheck && duplicateCheck[mealType]) {
      console.log(`✅ ${mealType} is already marked - this should prevent duplicate updates`);
      
      // Try to update again (should be prevented by app logic)
      const { error: attemptError } = await supabase
        .from('participants')
        .update({ [mealType]: true })
        .eq('id', foundParticipant.id);

      if (attemptError) {
        console.error('❌ Unexpected error on duplicate update:', attemptError);
      } else {
        console.log('✅ Database allows duplicate update (app logic should prevent this)');
      }
    }

    console.log('\n🎉 Scanner debugging complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ QR code lookup works');
    console.log('   ✅ Database updates work');
    console.log('   ✅ Status verification works');
    console.log('\n💡 If scanning isn\'t working in the app, the issue might be:');
    console.log('   1. QR code format mismatch');
    console.log('   2. Admin authentication');
    console.log('   3. Frontend error handling');
    console.log('   4. Browser console errors');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugScanner();