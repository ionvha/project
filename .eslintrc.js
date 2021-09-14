module.exports = {
    // 只会在当前目录多去eslint配置文件，不会跑到父级目录中
    'root': true,
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        // (关闭规则:'off'或0) （警告：“warn”或1） （错误：“error”或2）
        "no-unused-vars": 1, // 禁止未出现过的变量
        "no-constant-condition": 1, // 禁止在条件中使用常量表达式
        "no-empty": 1, // 禁止出现空语句快
        // double 双引号 single 单引号 backtick 反引号
        "quotes": ["error", "backtick", { "avoidEscape": true, "allowTemplateLiterals": true }],
        "no-multi-spaces": 2
    }
};
