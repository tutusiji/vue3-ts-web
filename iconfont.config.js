import { getSvgTSReactComponentContent, toBigCamelCase } from 'iconfont-spanner'

/** @type {import('iconfont-spanner').FontManagerOption} */
export default {
  resourceDir: 'src/assets/svgs',
  output: {
    // 生成和字体
    font: {
      // 输出目录
      dir: 'src/assets/fonts',
      // 字体名称
      name: 'iconfont',
      // 生成的字体格式，支持 "ttf", "woff", "woff2"
      types: ['ttf', 'woff', 'woff2'],
      // 格式化输出内容，type 为 "css" | "typescript"
      format: (content, type) => content, // 可以使用格式化程序处理 content
      // 自定义字体样式
      style: (fontName) => {
        return `
          font-size: 1em;
					font-family: "${fontName}" !important;
					font-style: normal;
					-webkit-font-smoothing: antialiased;
					-moz-osx-font-smoothing: grayscale;
				`
      }
    },
    // 转化为组件，比如 react 组件
    component: {
      // 输出目录
      dir: 'src/fonts/components',
      // 组件文件名，需要带上文件扩展名
      fileFullName: (fileName) => `${toBigCamelCase(fileName)}.tsx`,
      // 组件名称
      name: (fileName) => toBigCamelCase(fileName),
      // 组件内容
      content: getSvgTSReactComponentContent,
      // 是否使用 currentColor 填充 svg fill 属性，如果不填充，则保留原色，可以用来实现彩色图标
      fillCurrentColor: (fileName) => !fileName.endsWith('_oc')
    }
  },
  // 扫描引用情况
  scan: {
    includes: ['src/**/*.{ts,tsx,js,jsx}'],
    excludes: ['src/font/**/*', '**/*.d.ts'] // 需要明确排除的文件，这会影响到扫描结果
  }
}
