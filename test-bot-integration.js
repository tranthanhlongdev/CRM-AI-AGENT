// Node.js Integration Test cho HDBank Bot Chat API
// Usage: node test-bot-integration.js [backend_url]

const https = require("https");
const http = require("http");
const url = require("url");

// Configuration
const BACKEND_URL = process.argv[2] || "http://localhost:5000";
const TIMEOUT = 10000; // 10 seconds

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

console.log(
  `${colors.blue}🚀 HDBank Bot Chat API Integration Test${colors.reset}`
);
console.log(`${colors.yellow}Backend URL: ${BACKEND_URL}${colors.reset}`);
console.log(`${colors.white}================================${colors.reset}\n`);

// HTTP request helper
function makeRequest(endpoint, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${BACKEND_URL}${endpoint}`);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: TIMEOUT,
    };

    const req = (urlObj.protocol === "https:" ? https : http).request(
      options,
      (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {};
            resolve({
              statusCode: res.statusCode,
              data: parsedData,
              raw: responseData,
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: responseData,
              raw: responseData,
            });
          }
        });
      }
    );

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (data && method !== "GET") {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test runner
async function runTest(name, endpoint, method = "GET", data = null) {
  console.log(`${colors.cyan}🔍 Testing: ${name}${colors.reset}`);
  console.log(
    `${colors.white}----------------------------------------${colors.reset}`
  );

  try {
    const response = await makeRequest(endpoint, method, data);

    console.log(`HTTP Status: ${response.statusCode}`);
    console.log("Response:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ SUCCESS${colors.reset}\n`);
      return { success: true, response };
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset}\n`);
      return { success: false, response };
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}\n`);
    return { success: false, error: error.message };
  }
}

// Test suite
async function runAllTests() {
  const results = [];

  // Test 1: Phone verification - existing customer
  results.push(
    await runTest(
      "1. Phone Verification - Existing Customer",
      "/api/bot/verify-phone",
      "POST",
      { phoneNumber: "0123456789" }
    )
  );

  // Test 2: Phone verification - new customer
  results.push(
    await runTest(
      "2. Phone Verification - New Customer",
      "/api/bot/verify-phone",
      "POST",
      { phoneNumber: "0999999999" }
    )
  );

  // Test 3: Bot chat - existing customer
  results.push(
    await runTest("3. Bot Chat - Existing Customer", "/api/bot/chat", "POST", {
      message: "Tôi muốn mở tài khoản tiết kiệm",
      customerInfo: {
        phone: "0123456789",
        name: "Nguyễn Văn A",
        cif: "CIF001234567",
        isExistingCustomer: true,
      },
    })
  );

  // Test 4: Bot chat - new customer
  results.push(
    await runTest("4. Bot Chat - New Customer", "/api/bot/chat", "POST", {
      message: "Tôi muốn mở tài khoản tiết kiệm",
      customerInfo: {
        phone: "0999999999",
        name: "Khách hàng mới",
        isExistingCustomer: false,
      },
    })
  );

  // Test 5: Bot chat - credit card inquiry
  results.push(
    await runTest(
      "5. Bot Chat - Credit Card Inquiry",
      "/api/bot/chat",
      "POST",
      {
        message: "Các loại thẻ tín dụng có gì?",
        customerInfo: {
          phone: "0123456789",
          name: "Nguyễn Văn A",
          isExistingCustomer: true,
        },
      }
    )
  );

  // Test 6: Bot chat with conversation ID
  results.push(
    await runTest(
      "6. Bot Chat - Home Loan with Conversation ID",
      "/api/bot/chat",
      "POST",
      {
        message: "Lãi suất vay mua nhà hiện tại là bao nhiêu?",
        customerInfo: {
          phone: "0987654321",
          name: "Trần Thị B",
          isExistingCustomer: true,
        },
        conversationId: "test_conv_001",
      }
    )
  );

  // Test 7: Get conversation history
  results.push(
    await runTest(
      "7. Get Conversation History",
      "/api/bot/conversation/test_conv_001",
      "GET"
    )
  );

  // Test 8: Bot chat - Block card intent
  results.push(
    await runTest("8. Bot Chat - Block Card Intent", "/api/bot/chat", "POST", {
      message: "Tôi muốn khóa thẻ tín dụng",
      customerInfo: {
        phone: "0123456789",
        name: "Nguyễn Văn A",
        cif: "CIF001234567",
        isExistingCustomer: true,
      },
    })
  );

  // Test 9: Bot chat - Lost card scenario
  results.push(
    await runTest("9. Bot Chat - Lost Card Scenario", "/api/bot/chat", "POST", {
      message: "Thẻ tôi bị mất, cần khóa ngay",
      customerInfo: {
        phone: "0987654321",
        name: "Trần Thị B",
        cif: "CIF007654321",
        isExistingCustomer: true,
      },
    })
  );

  // Test 10: Lấy danh sách thẻ theo CIF
  results.push(
    await runTest(
      "10. Get Cards by CIF",
      "/api/cards/by-cif/CIF001234567",
      "GET"
    )
  );

  // Test 11: Khóa thẻ API
  results.push(
    await runTest("11. Block Card API", "/api/cards/block", "POST", {
      cardId: "CARD_123456789",
      cifNumber: "CIF001234567",
      blockReason: "lost",
      blockType: "permanent",
      customerVerification: {
        fullName: "Nguyễn Văn A",
        dateOfBirth: "01/01/1990",
        idNumber: "123456789",
      },
      notes: "Khách hàng báo mất thẻ qua bot chat",
    })
  );

  // Test 12: Bot chat với conversation flow
  results.push(
    await runTest(
      "12. Bot Chat - Conversation Flow Step 1",
      "/api/bot/chat",
      "POST",
      {
        message: "Tôi muốn khóa thẻ",
        customerInfo: {
          phone: "0123456789",
          name: "Nguyễn Văn A",
          cif: "CIF001234567",
          isExistingCustomer: true,
        },
      }
    )
  );

  // Test 13: Error case - Thiếu dữ liệu
  results.push(
    await runTest("13. Error Case - Missing Data", "/api/cards/block", "POST", {
      cardId: "CARD_123456789",
      cifNumber: "CIF001234567",
    })
  );

  // Print summary
  console.log(`${colors.yellow}📊 Test Summary${colors.reset}`);
  console.log(`${colors.white}================================${colors.reset}`);

  const successful = results.filter((r) => r.success).length;
  const total = results.length;

  console.log(
    `${colors.green}✅ Successful: ${successful}/${total}${colors.reset}`
  );
  console.log(
    `${colors.red}❌ Failed: ${total - successful}/${total}${colors.reset}`
  );

  if (successful === total) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}`);
  } else {
    console.log(
      `${colors.red}⚠️  Some tests failed. Check backend server.${colors.reset}`
    );
  }

  console.log(`\n${colors.blue}💡 Tips:${colors.reset}`);
  console.log("- Start backend: npm start (or your backend start command)");
  console.log(
    "- Change URL: node test-bot-integration.js http://your-backend-url"
  );
  console.log("- Check backend logs for detailed error information");

  return results;
}

// Run all tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest, makeRequest };
