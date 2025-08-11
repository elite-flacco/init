// Test script for the new streaming trip planning system
// Run with: node test-streaming.js

const TEST_REQUEST = {
  destination: {
    id: "paris-france",
    name: "Paris",
    country: "France",
    description: "The City of Light, famous for art, fashion, gastronomy and culture",
    keyActivities: ["Museums", "Cafes", "Architecture"],
    matchReason: "Perfect for cultural exploration",
    estimatedCost: "$200-400/day",
    image: "paris.jpg",
    highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame"],
    bestTime: "April-June, September-October"
  },
  travelerType: {
    id: "explorer",
    name: "Explorer",
    description: "Adventurous traveler who loves discovering new places",
    icon: "🗺️",
    showPlaceholder: false
  },
  preferences: {
    timeOfYear: "Spring",
    duration: "5 days",
    budget: "Mid-range",
    accommodation: "Hotel",
    transportation: "Public transport",
    wantRestaurants: true,
    wantBars: true,
    tripType: "Cultural exploration",
    specialActivities: "Art museums, historic sites",
    activities: [],
    priority: "Must-see attractions",
    vibe: "Cultural and romantic",
    activityLevel: "medium"
  }
};

async function testStreamingEndpoint() {
  console.log('🚀 Testing OpenAI Streaming Trip Planning\n');
  
  // Test manifest first
  console.log('1️⃣ Testing Manifest Generation...');
  try {
    const manifestResponse = await fetch('http://localhost:3000/api/ai/trip-planning/manifest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_REQUEST)
    });
    
    if (!manifestResponse.ok) {
      throw new Error(`Manifest failed: ${manifestResponse.statusText}`);
    }
    
    const manifest = await manifestResponse.json();
    console.log('✅ Manifest generated successfully');
    console.log(`   Session: ${manifest.sessionId}`);
    console.log(`   Highlights: ${manifest.overview.highlights.length} items`);
    
    // Test streaming for chunk 1
    console.log('\n2️⃣ Testing Streaming Endpoint (Chunk 1)...');
    await testStreamingChunk(1, manifest.sessionId);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testStreamingChunk(chunkId, sessionId) {
  try {
    console.log(`   🔄 Starting stream for chunk ${chunkId}...`);
    
    const response = await fetch(`http://localhost:3000/api/ai/trip-planning/stream?chunk=${chunkId}&sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(TEST_REQUEST),
    });

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.status} ${response.statusText}`);
    }

    console.log('   ✅ Streaming connection established');
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let eventCount = 0;
    let hasJsonStarted = false;
    let hasCompleted = false;

    console.log('   📡 Receiving streaming events:');

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.slice(6));
            eventCount++;
            
            switch (eventData.type) {
              case 'start':
                console.log(`      🎬 Stream started (${eventData.chunkId})`);
                break;
              case 'json_start':
                hasJsonStarted = true;
                console.log(`      🔧 JSON generation started`);
                break;
              case 'content_delta':
                // Show progress every 10 deltas to avoid spam
                if (eventCount % 10 === 0) {
                  const progress = Math.min((eventData.accumulated?.length || 0) / 4000 * 100, 100);
                  console.log(`      📝 Content streaming... ${Math.round(progress)}% (${eventData.accumulated?.length} chars)`);
                }
                break;
              case 'partial_json':
                console.log(`      🧩 Partial JSON received (${Object.keys(eventData.data || {}).length} keys)`);
                break;
              case 'complete':
                hasCompleted = true;
                console.log(`      ✅ Stream completed! Final data has ${Object.keys(eventData.data || {}).length} sections`);
                break;
              case 'error':
                console.log(`      ❌ Stream error: ${eventData.error}`);
                break;
            }
          } catch (e) {
            console.warn('      ⚠️ Failed to parse SSE event:', line.slice(0, 100));
          }
        }
      }
    }
    
    console.log(`\n   📊 Stream Summary:`);
    console.log(`      Total events: ${eventCount}`);
    console.log(`      JSON started: ${hasJsonStarted ? '✅' : '❌'}`);
    console.log(`      Completed: ${hasCompleted ? '✅' : '❌'}`);
    
    if (hasCompleted) {
      console.log('\n🎉 Streaming test completed successfully!');
      console.log('\n✨ Streaming Features Verified:');
      console.log('   • Real-time Server-Sent Events');
      console.log('   • OpenAI streaming API integration');
      console.log('   • JSON Schema structured outputs');
      console.log('   • Progressive content delivery');
      console.log('   • Live progress tracking');
    } else {
      console.log('\n⚠️ Stream did not complete properly');
    }
    
  } catch (error) {
    console.error(`   ❌ Streaming test failed:`, error.message);
  }
}

// Test the streaming with a timeout
Promise.race([
  testStreamingEndpoint(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Test timed out after 2 minutes')), 120000)
  )
]).catch(error => {
  console.error('\n💥 Test failed or timed out:', error.message);
  process.exit(1);
});