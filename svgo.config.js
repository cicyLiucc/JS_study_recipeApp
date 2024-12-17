module.exports = {
  multipass: true, // 多次优化以达到最大压缩
  plugins: [
    {
      name: 'preset-default', // 启用默认配置
      params: {
        overrides: {
          removeViewBox: false, // 保留 viewBox 属性，避免 SVG 缩放问题
          cleanupIDs: false, // 禁用 id 清理，防止 id 冲突
          mergePaths: false, // 禁用路径合并，确保图标结构正常
          removeUnknownsAndDefaults: false, // 保留默认值，避免丢失必要属性
        },
      },
    },
  ],
};
