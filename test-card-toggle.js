#!/usr/bin/env node

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

console.log(
  `${colors.cyan}🧪 Testing Card Block/Unblock API Integration${colors.reset}\n`
);

// Base URL cho API
const BASE_URL = "http://localhost:5000";

/**
 * Make API request
 */
async function makeRequest(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      statusText: response.statusText,
      data: data,
    };
  } catch (error) {
    return {
      status: 0,
      statusText: "Network Error",
      data: { error: error.message },
    };
  }
}

/**
 * Test lấy danh sách thẻ
 */
async function testGetCards() {
  console.log(
    `${colors.blue}1. Testing GET /api/cards/by-cif/CIF808080?full_info=true${colors.reset}`
  );

  const result = await makeRequest(
    "/api/cards/by-cif/CIF808080?full_info=true"
  );

  console.log(`Status: ${result.status} ${result.statusText}`);

  if (result.status === 200) {
    console.log(`${colors.green}✅ Success${colors.reset}`);
    console.log("Response structure:");
    console.log(`- success: ${result.data.success}`);
    console.log(`- message: ${result.data.message}`);
    console.log(`- total cards: ${result.data.data?.total || 0}`);

    if (result.data.data?.cards?.length > 0) {
      const cards = result.data.data.cards;
      console.log(`\n📋 Cards Classification:`);

      const primaryCards = cards.filter((card) => card.is_main_card === 0);
      const supplementaryCards = cards.filter(
        (card) => card.is_main_card === 1
      );

      console.log(`- Primary Cards (is_main_card = 0): ${primaryCards.length}`);
      primaryCards.forEach((card, index) => {
        console.log(
          `  ${index + 1}. ${card.cardName} (${card.cardId}) - ${
            card.statusDisplay
          }`
        );
      });

      console.log(
        `- Supplementary Cards (is_main_card = 1): ${supplementaryCards.length}`
      );
      supplementaryCards.forEach((card, index) => {
        console.log(
          `  ${index + 1}. ${card.cardName} (${card.cardId}) - ${
            card.statusDisplay
          }`
        );
        if (card.holderName) console.log(`     Holder: ${card.holderName}`);
        if (card.relationshipToMainCard)
          console.log(`     Relationship: ${card.relationshipToMainCard}`);
      });

      return cards[0].cardId;
    }
  } else {
    console.log(`${colors.red}❌ Failed${colors.reset}`);
    console.log(JSON.stringify(result.data, null, 2));
  }

  return null;
}

/**
 * Test khóa thẻ
 */
async function testBlockCard(cardId) {
  console.log(
    `\n${colors.blue}2. Testing POST /api/cards/block${colors.reset}`
  );

  const result = await makeRequest("/api/cards/block", "POST", { cardId });

  console.log(`Status: ${result.status} ${result.statusText}`);

  if (result.status === 200) {
    console.log(`${colors.green}✅ Success${colors.reset}`);
    console.log("Block Response:");
    console.log(`- success: ${result.data.success}`);
    console.log(`- message: ${result.data.message}`);

    if (result.data.data) {
      const data = result.data.data;
      console.log(`\n📋 Block Result:`);
      console.log(`- Card ID: ${data.cardId}`);
      console.log(`- Previous Status: ${data.previousStatus}`);
      console.log(`- Current Status: ${data.currentStatus}`);
      console.log(`- Block Time: ${data.blockTime}`);
    }

    return true;
  } else {
    console.log(`${colors.red}❌ Failed${colors.reset}`);
    console.log(JSON.stringify(result.data, null, 2));
    return false;
  }
}

/**
 * Test mở khóa thẻ
 */
async function testUnblockCard(cardId) {
  console.log(
    `\n${colors.blue}3. Testing POST /api/cards/unblock${colors.reset}`
  );

  const result = await makeRequest("/api/cards/unblock", "POST", { cardId });

  console.log(`Status: ${result.status} ${result.statusText}`);

  if (result.status === 200) {
    console.log(`${colors.green}✅ Success${colors.reset}`);
    console.log("Unblock Response:");
    console.log(`- success: ${result.data.success}`);
    console.log(`- message: ${result.data.message}`);

    if (result.data.data) {
      const data = result.data.data;
      console.log(`\n📋 Unblock Result:`);
      console.log(`- Card ID: ${data.cardId}`);
      console.log(`- Previous Status: ${data.previousStatus}`);
      console.log(`- Current Status: ${data.currentStatus}`);
      console.log(`- Unblock Time: ${data.unblockTime}`);
    }

    return true;
  } else {
    console.log(`${colors.red}❌ Failed${colors.reset}`);
    console.log(JSON.stringify(result.data, null, 2));
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  try {
    // Test 1: Get cards
    const cardId = await testGetCards();

    if (!cardId) {
      console.log(
        `${colors.yellow}⚠️  No cards found, using default cardId for testing${colors.reset}`
      );
      const defaultCardId = "CARD_808080001";

      // Test 2: Block card
      const blockSuccess = await testBlockCard(defaultCardId);

      if (blockSuccess) {
        // Test 3: Unblock card
        await testUnblockCard(defaultCardId);
      }
    } else {
      // Test 2: Block card
      const blockSuccess = await testBlockCard(cardId);

      if (blockSuccess) {
        // Test 3: Unblock card
        await testUnblockCard(cardId);
      }
    }

    console.log(
      `\n${colors.cyan}🎉 Card Block/Unblock API Testing Complete!${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}❌ Test Error:${colors.reset}`, error.message);
  }
}

// Chạy tests
runTests();
