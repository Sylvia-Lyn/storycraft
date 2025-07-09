// 测试手机号验证功能

// 手机号验证规则配置
const phoneValidationRules = {
    '86': { length: 11, pattern: /^1[3-9]\d{9}$/ }, // 中国大陆
    '852': { length: 8, pattern: /^[5-9]\d{7}$/ }, // 香港
    '853': { length: 8, pattern: /^6\d{7}$/ }, // 澳门
    '886': { length: 9, pattern: /^9\d{8}$/ }, // 台湾
};

// 验证手机号是否符合对应国家/地区的格式
function validatePhoneNumber(phone, countryCode) {
    const cc = countryCode.replace(/^\+/, '');
    const rule = phoneValidationRules[cc];
    
    if (!rule) {
        // 对于未配置的国家，使用通用规则
        return /^[0-9]{4,20}$/.test(phone);
    }
    
    return phone.length === rule.length && rule.pattern.test(phone);
}

// 手机号格式化函数，严格按照 ^\+[1-9]\d{0,3}\s\d{4,20}$ 规则
function formatPhoneNumber(phone, countryCode = '+86') {
    let p = phone.trim().replace(/\s+/g, '');

    // 提取纯数字手机号
    if (/^[0-9]{4,20}$/.test(p)) {
        // 处理区号：移除+号和空格，验证格式
        let cc = countryCode.trim().replace(/\s+/g, '').replace(/^\+/, '');
        // 区号只允许1-4位数字，且首位不能为0
        if (!/^[1-9]\d{0,3}$/.test(cc)) {
            cc = '86'; // 默认中国大陆
        }
        return `+${cc} ${p}`;
    }

    // +区号手机号（无空格），插入空格
    if (/^\+[1-9]\d{0,3}[0-9]{4,20}$/.test(p)) {
        return p.replace(/^(\+[1-9]\d{0,3})([0-9]{4,20})$/, '$1 $2');
    }

    // 已经是正确格式
    if (/^\+[1-9]\d{0,3}\s[0-9]{4,20}$/.test(p)) {
        return p;
    }

    // 兜底：如果都不匹配，返回原始输入
    return p;
}

// 测试用例
const testCases = [
    // 中国大陆手机号测试
    { phone: '13812345678', countryCode: '+86', expected: true, description: '中国大陆正确手机号' },
    { phone: '12812345678', countryCode: '+86', expected: false, description: '中国大陆错误手机号（12开头）' },
    { phone: '1381234567', countryCode: '+86', expected: false, description: '中国大陆错误手机号（10位）' },
    { phone: '138123456789', countryCode: '+86', expected: false, description: '中国大陆错误手机号（12位）' },
    
    // 香港手机号测试
    { phone: '51234567', countryCode: '+852', expected: true, description: '香港正确手机号' },
    { phone: '41234567', countryCode: '+852', expected: false, description: '香港错误手机号（4开头）' },
    { phone: '512345678', countryCode: '+852', expected: false, description: '香港错误手机号（9位）' },
    
    // 澳门手机号测试
    { phone: '61234567', countryCode: '+853', expected: true, description: '澳门正确手机号' },
    { phone: '51234567', countryCode: '+853', expected: false, description: '澳门错误手机号（5开头）' },
    
    // 台湾手机号测试
    { phone: '912345678', countryCode: '+886', expected: true, description: '台湾正确手机号' },
    { phone: '812345678', countryCode: '+886', expected: false, description: '台湾错误手机号（8开头）' },
];

// 格式化测试用例
const formatTestCases = [
    { phone: '13812345678', countryCode: '+86', expected: '+86 13812345678' },
    { phone: '+8613812345678', countryCode: '+86', expected: '+86 13812345678' },
    { phone: '+86 13812345678', countryCode: '+86', expected: '+86 13812345678' },
    { phone: '51234567', countryCode: '+852', expected: '+852 51234567' },
    { phone: '+85251234567', countryCode: '+852', expected: '+852 51234567' },
];

console.log('=== 手机号验证测试 ===');
testCases.forEach((testCase, index) => {
    const result = validatePhoneNumber(testCase.phone, testCase.countryCode);
    const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${testCase.description}`);
    console.log(`   输入: ${testCase.phone} (${testCase.countryCode})`);
    console.log(`   期望: ${testCase.expected}, 实际: ${result}`);
    console.log('');
});

console.log('=== 手机号格式化测试 ===');
formatTestCases.forEach((testCase, index) => {
    const result = formatPhoneNumber(testCase.phone, testCase.countryCode);
    const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status}`);
    console.log(`   输入: "${testCase.phone}" (${testCase.countryCode})`);
    console.log(`   期望: "${testCase.expected}"`);
    console.log(`   实际: "${result}"`);
    console.log('');
});
