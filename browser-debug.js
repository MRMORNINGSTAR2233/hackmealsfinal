console.log('🔍 Admin Scanner Debug Helper');
console.log('📱 Use this in browser console while testing scanner');
console.log('');

// Helper function to check current user state
window.debugAdminState = function() {
  const store = window.__zustandStore || null;
  if (!store) {
    console.log('❌ Zustand store not found');
    return;
  }
  
  const state = store.getState();
  console.log('👤 Current User:', state.currentUser);
  console.log('👥 Participants loaded:', state.participants?.length || 0);
  console.log('🔐 Is Admin:', state.currentUser?.role === 'admin');
};

// Helper function to test QR scanning manually
window.testQRScan = async function(qrCode) {
  console.log('🔍 Testing QR scan for:', qrCode);
  
  try {
    const store = window.__zustandStore;
    if (!store) {
      console.log('❌ Store not found');
      return;
    }
    
    const { getParticipant, updateMealStatus } = store.getState();
    
    // Test getParticipant
    console.log('1. Looking up participant...');
    const participant = await getParticipant(qrCode);
    
    if (!participant) {
      console.log('❌ Participant not found');
      return;
    }
    
    console.log('✅ Participant found:', participant.name);
    console.log('📊 Current meal status:', {
      breakfast: participant.breakfast,
      lunch: participant.lunch,
      dinner: participant.dinner
    });
    
    // Test meal update
    console.log('2. Testing meal update (breakfast)...');
    const success = await updateMealStatus(participant.id, 'breakfast');
    
    if (success) {
      console.log('✅ Meal status updated successfully');
    } else {
      console.log('⚠️ Meal status not updated (might already be marked)');
    }
    
    // Check updated status
    const updatedParticipant = await getParticipant(qrCode);
    console.log('📊 Updated meal status:', {
      breakfast: updatedParticipant.breakfast,
      lunch: updatedParticipant.lunch,
      dinner: updatedParticipant.dinner
    });
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

console.log('');
console.log('📋 Available commands:');
console.log('  debugAdminState() - Check admin login state');
console.log('  testQRScan("QR_CODE_HERE") - Test QR scanning manually');
console.log('');
console.log('🎯 Sample QR codes to test:');
console.log('  testQRScan("HACK-1761989827237-2-x0u2ue7l8")');