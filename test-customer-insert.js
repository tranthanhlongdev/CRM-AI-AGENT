// Test Customer INSERT - Debug Script
// Kiểm tra và sửa lỗi câu lệnh INSERT cho customers

const API_BASE_URL = process.argv[2] || "http://localhost:5000";

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

console.log(`${colors.blue}🔧 HDBank Customer INSERT Test${colors.reset}`);
console.log(`${colors.yellow}API URL: ${API_BASE_URL}${colors.reset}`);
console.log(`${colors.white}===============================${colors.reset}\n`);

// Sample customer data theo format từ frontend
const testCustomers = [
  {
    cifNumber: "CIF001234567",
    hoTen: "Nguyễn Văn Test",
    cmnd: "123456789012",
    ngaySinh: "1990-01-01",
    gioiTinh: "Nam",
    diaChi: "123 Đường Test, Phường Test, Quận Test, TP.HCM",
    soDienThoai: "0123456789",
    email: "test@hdbank.com",
    ngheNghiep: "Kỹ sư",
    tinhTrangHonNhan: "Độc thân",
    mucThuNhap: 15000000,
    soTaiKhoan: "1234567890123456",
    loaiKhachHang: "Cá nhân",
    segmentKH: "Premium",
    trangThaiKH: "Hoạt động",
    nhanVienQuanLy: "Trần Thị Manager",
    chiNhanh: "CN Test",
    soDuHienTai: 1000000,
  },
  {
    cifNumber: "CIF007654321",
    hoTen: "Trần Thị B",
    cmnd: "987654321098",
    ngaySinh: "1985-05-15",
    gioiTinh: "Nữ",
    diaChi: "456 Đường B, Phường B, Quận B, Hà Nội",
    soDienThoai: "0987654321",
    email: "tranthib@hdbank.com",
    ngheNghiep: "Bác sĩ",
    tinhTrangHonNhan: "Có gia đình",
    mucThuNhap: 25000000,
    soTaiKhoan: "9876543210987654",
    loaiKhachHang: "Cá nhân",
    segmentKH: "VIP",
    trangThaiKH: "Hoạt động",
    nhanVienQuanLy: "Nguyễn Văn Manager",
    chiNhanh: "CN Hà Nội",
    soDuHienTai: 5000000,
  },
  {
    // Test data with potential issues
    cifNumber: "CIF999888777",
    hoTen: "Lê Văn C",
    cmnd: "999888777666",
    ngaySinh: "1995-12-31",
    gioiTinh: "Nam",
    diaChi: "789 Đường C, Phường C, Quận C, Đà Nẵng",
    soDienThoai: "0999888777",
    email: "levanc@hdbank.com",
    ngheNghiep: "Kinh doanh",
    tinhTrangHonNhan: "Độc thân",
    mucThuNhap: 0, // Test với 0
    soTaiKhoan: "9998887776665555",
    loaiKhachHang: "Cá nhân",
    segmentKH: "Basic",
    trangThaiKH: "Hoạt động",
    nhanVienQuanLy: "Phạm Thị Manager",
    chiNhanh: "CN Đà Nẵng",
    soDuHienTai: 0, // Test với 0
  },
];

// Helper function để make API request
async function makeRequest(endpoint, method = "GET", data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (data && method !== "GET") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.text();

    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = responseData;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data: parsedData,
      raw: responseData,
    };
  } catch (error) {
    return {
      status: 0,
      statusText: "Network Error",
      error: error.message,
      data: null,
    };
  }
}

// Test validation functions
function validateCustomerData(customerData) {
  const errors = [];

  // Required fields
  const requiredFields = [
    "cifNumber",
    "hoTen",
    "cmnd",
    "ngaySinh",
    "soDienThoai",
    "email",
    "soTaiKhoan",
    "chiNhanh",
    "nhanVienQuanLy",
  ];

  requiredFields.forEach((field) => {
    if (!customerData[field] || customerData[field].toString().trim() === "") {
      errors.push(`${field} is required`);
    }
  });

  // Format validations
  if (
    customerData.cifNumber &&
    !/^CIF[0-9]{6,}$/.test(customerData.cifNumber)
  ) {
    errors.push("CIF format invalid (should be CIF + 6+ digits)");
  }

  if (
    customerData.soDienThoai &&
    !/^[0-9]{10,11}$/.test(customerData.soDienThoai)
  ) {
    errors.push("Phone format invalid (should be 10-11 digits)");
  }

  if (customerData.email && !/\S+@\S+\.\S+/.test(customerData.email)) {
    errors.push("Email format invalid");
  }

  if (customerData.cmnd && !/^[0-9]{9,12}$/.test(customerData.cmnd)) {
    errors.push("CMND format invalid (should be 9-12 digits)");
  }

  if (
    customerData.soTaiKhoan &&
    !/^[0-9]{10,20}$/.test(customerData.soTaiKhoan)
  ) {
    errors.push("Account number format invalid (should be 10-20 digits)");
  }

  // Date validation
  if (customerData.ngaySinh) {
    const date = new Date(customerData.ngaySinh);
    if (isNaN(date.getTime())) {
      errors.push("Birth date format invalid (should be YYYY-MM-DD)");
    }
  }

  // Number validations
  if (customerData.mucThuNhap !== undefined && customerData.mucThuNhap < 0) {
    errors.push("Income cannot be negative");
  }

  if (customerData.soDuHienTai !== undefined && customerData.soDuHienTai < 0) {
    errors.push("Current balance cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Test individual customer creation
async function testCreateCustomer(customerData, index) {
  console.log(
    `${colors.cyan}📝 Test ${index + 1}: Creating customer ${
      customerData.hoTen
    }${colors.reset}`
  );
  console.log("-------------------------------------------");

  // Step 1: Validate data
  console.log("1. Validating customer data...");
  const validation = validateCustomerData(customerData);

  if (!validation.isValid) {
    console.log(`${colors.red}❌ Validation failed:${colors.reset}`);
    validation.errors.forEach((error) => {
      console.log(`   - ${error}`);
    });
    console.log();
    return { success: false, step: "validation", errors: validation.errors };
  }

  console.log(`${colors.green}✅ Validation passed${colors.reset}`);

  // Step 2: Check if customer already exists
  console.log("2. Checking if customer exists...");
  const checkResult = await makeRequest(
    `/api/customers/${customerData.cifNumber}`
  );

  if (checkResult.status === 200) {
    console.log(`${colors.yellow}⚠️  Customer already exists${colors.reset}`);
    console.log();
    return { success: false, step: "exists", data: checkResult.data };
  }

  console.log(`${colors.green}✅ Customer does not exist${colors.reset}`);

  // Step 3: Create customer
  console.log("3. Creating customer...");
  console.log("Data to send:");
  console.log(JSON.stringify(customerData, null, 2));

  const createResult = await makeRequest(
    "/api/customers/create",
    "POST",
    customerData
  );

  console.log(`Status: ${createResult.status} ${createResult.statusText}`);
  console.log("Response:");
  console.log(JSON.stringify(createResult.data, null, 2));

  if (createResult.status === 200 || createResult.status === 201) {
    console.log(
      `${colors.green}✅ Customer created successfully${colors.reset}`
    );
    return { success: true, step: "created", data: createResult.data };
  } else {
    console.log(`${colors.red}❌ Failed to create customer${colors.reset}`);
    return {
      success: false,
      step: "creation",
      error: createResult.data,
      status: createResult.status,
    };
  }
}

// Test search functionality
async function testSearchCustomer(cifNumber) {
  console.log(
    `${colors.cyan}🔍 Testing search for CIF: ${cifNumber}${colors.reset}`
  );
  console.log("-------------------------------------------");

  const searchResult = await makeRequest(
    `/api/customers/search-complete?cif=${cifNumber}`
  );

  console.log(`Status: ${searchResult.status} ${searchResult.statusText}`);
  console.log("Response:");
  console.log(JSON.stringify(searchResult.data, null, 2));

  if (searchResult.status === 200) {
    console.log(`${colors.green}✅ Search successful${colors.reset}`);
    return { success: true, data: searchResult.data };
  } else {
    console.log(`${colors.red}❌ Search failed${colors.reset}`);
    return { success: false, error: searchResult.data };
  }
}

// Main test function
async function runAllTests() {
  console.log(
    `${colors.blue}🚀 Starting Customer INSERT Tests${colors.reset}\n`
  );

  const results = [];

  // Test each customer
  for (let i = 0; i < testCustomers.length; i++) {
    const result = await testCreateCustomer(testCustomers[i], i);
    results.push(result);
    console.log();
  }

  // Test search functionality
  console.log(`${colors.blue}🔍 Testing Search Functionality${colors.reset}\n`);

  for (const customer of testCustomers) {
    await testSearchCustomer(customer.cifNumber);
    console.log();
  }

  // Summary
  console.log(`${colors.yellow}📊 Test Summary${colors.reset}`);
  console.log("===============================");

  const successful = results.filter((r) => r.success).length;
  const total = results.length;

  console.log(
    `${colors.green}✅ Successful: ${successful}/${total}${colors.reset}`
  );
  console.log(
    `${colors.red}❌ Failed: ${total - successful}/${total}${colors.reset}`
  );

  // Detailed failure analysis
  const failures = results.filter((r) => !r.success);
  if (failures.length > 0) {
    console.log(`\n${colors.red}🚨 Failure Analysis:${colors.reset}`);
    failures.forEach((failure, index) => {
      console.log(`\n${index + 1}. Failed at step: ${failure.step}`);
      if (failure.errors) {
        console.log("   Validation errors:", failure.errors);
      }
      if (failure.error) {
        console.log("   Error:", failure.error);
      }
      if (failure.status) {
        console.log("   HTTP Status:", failure.status);
      }
    });
  }

  console.log(`\n${colors.blue}💡 Common Solutions:${colors.reset}`);
  console.log("1. Check backend server is running on port 5000");
  console.log("2. Verify database connection and schema");
  console.log("3. Check API endpoint paths match");
  console.log("4. Validate data format (especially dates and numbers)");
  console.log("5. Check for unique constraint violations");
  console.log("6. Review backend error logs");

  console.log(`\n${colors.green}🛠️  SQL Debug Queries:${colors.reset}`);
  console.log("-- Check if customers table exists");
  console.log(
    'SELECT name FROM sqlite_master WHERE type="table" AND name="customers";'
  );
  console.log("\n-- Check table schema");
  console.log("PRAGMA table_info(customers);");
  console.log("\n-- Check existing data");
  console.log(
    "SELECT cif_number, ho_ten, trang_thai_kh FROM customers LIMIT 5;"
  );
  console.log("\n-- Check for duplicate CIFs");
  console.log(
    "SELECT cif_number, COUNT(*) FROM customers GROUP BY cif_number HAVING COUNT(*) > 1;"
  );

  return results;
}

// Error handling for common issues
process.on("unhandledRejection", (reason, promise) => {
  console.error(`${colors.red}❌ Unhandled rejection:${colors.reset}`, reason);
});

process.on("uncaughtException", (error) => {
  console.error(`${colors.red}❌ Uncaught exception:${colors.reset}`, error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error(
      `${colors.red}❌ Test execution failed:${colors.reset}`,
      error
    );
    process.exit(1);
  });
}

module.exports = { runAllTests, testCreateCustomer, validateCustomerData };
