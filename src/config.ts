import type {
	AnnouncementConfig,
	CommentConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	MusicPlayerConfig,
	NavBarConfig,
	ProfileConfig,
	SidebarLayoutConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
import { getTranslateLanguageFromConfig } from "./utils/language-utils";

// 定义站点语言
const SITE_LANG = "zh_CN"; // 语言代码，例如 'en'，'zh_CN'，'ja' 等

export const siteConfig: SiteConfig = {
	title: "フルショのブログ", // 修改为指定标题
	subtitle: "净整没用的", // 修改为指定副标题

	lang: SITE_LANG,

	themeColor: {
		hue: 240, // 修改为指定色调值
		fixed: true, // 对访客隐藏主题颜色选择器
	},
	translate: {
		enable: false, // 禁用翻译功能
		service: "client.edge",
		defaultLanguage: getTranslateLanguageFromConfig(SITE_LANG),
		showSelectTag: false,
		autoDiscriminate: true,
		ignoreClasses: ["ignore", "banner-title", "banner-subtitle"],
		ignoreTags: ["script", "style", "code", "pre"],
	},
	banner: {
		enable: true,

		src: {
			desktop: [
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/575ce11089a773b84d904991f410b84f460d762f.png@1500w.webp",
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/af7e274ee118ee4e6b7b999d9e09429fe53f0825.png@1500w.webp",
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/1618858e6b9b28bb2f83dac7e040e639967aaafb.png@1500w.webp",
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/ed8eaa7cbb9576d4807dd1d46a9086ac0ae7b171.png@1500w.webp",
			],
			mobile: [
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/4d2a047d5bdd5425ea474a3cc8d457757b0bf3fc.png@1400w.webp",
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/6f2ff5dafc9a3d3c7a4a02f0605b0f2be6eaad14.png@1400w.webp",
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/84521ffeb80a00fb30cdf4a9e491c7ae05b0a78a.png@1400w.webp",
				"https://bili-proxy.api.chenhen.top/bfs/openplatform/e4049615f3c5eeb6d0706edad06c2ed01ed32485.png@1400w.webp",
			],
		},

		position: "center", // 相当于 object-position，仅支持 'top'、'center'、'bottom'，默认为 'center'

		carousel: {
			enable: true,
			interval: 2, // 轮播间隔时间（秒）
		},

		homeText: {
			enable: true,
			title: "Ferxa1", // 修改为指定横幅标题
			subtitle: ["记录技术", "个人日记", "我的备忘录", "学习与交流"],
			typewriter: {
				enable: true, // 启用副标题打字机效果
				speed: 100, // 打字速度（毫秒）
				deleteSpeed: 50, // 删除速度（毫秒）
				pauseTime: 2000, // 完整显示后的暂停时间（毫秒）
			},
		},

		credit: {
			enable: false,
			text: "关于背景图",
			url: "/Bei-Jing",
		},
	},
	toc: {
		enable: true, // 启用目录功能
		depth: 3, // 修改为指定目录深度
	},
	favicon: [
		// 留空则使用默认favicon
		{
			src: "/favicon/icon_light_32.ico", // 图标文件路径
			theme: "light", // 可选，指定主题 'light' | 'dark'
			sizes: "32x32", // 可选，图标尺寸
		},
		{
			src: "/favicon/icon_dark_32.ico", // 图标文件路径
			theme: "dark", // 可选，指定主题 'light' | 'dark'
			sizes: "32x32", // 可选，图标尺寸
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		//自定义链接格式：
		//		{
		//			name: "GitHub",
		//			url: "https://github.com/matsuzaka-yuki",
		//			external: true,
		//		},
		// 支持自定义导航栏链接,并且支持多级菜单,3.1版本新加
		{
			name: "我的",
			url: "/content/",
			children: [LinkPreset.Anime, LinkPreset.Diary, LinkPreset.Gallery],
		},
		{
			name: "关于",
			url: "/content/",
			children: [LinkPreset.About, LinkPreset.Friends],
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar:
		"https://bili-proxy.api.chenhen.top/bfs/openplatform/c9c1d43e62d2159ccc375689a39be6bcdc58a42e.png@400w_400h.webp",
	name: "Ferxa1", // 修改为指定昵称
	bio: "净整没用的", // 修改为指定简介
	links: [
		{
			name: "B站", // 保留B站链接
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/1197710906", // 修改为指定链接
		},
		{
			name: "GitHub", // 修改为GitHub链接
			icon: "fa6-brands:github", // 修改为指定图标
			url: "https://github.com/ferxal", // 修改为指定链接
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: false, // 禁用许可证显示
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};

export const commentConfig: CommentConfig = {
	enable: true, // 启用评论功能
	twikoo: {
		envId: "https://twikoo.api.chenhen.top", // 指定Twikoo环境ID
	},
};

export const announcementConfig: AnnouncementConfig = {
	title: "公告", // Announcement title
	content: "欢迎来到我的博客", // Announcement content
	closable: false, // Allow users to close the announcement
	link: {
		enable: true, // Enable link
		text: "了解更多", // Link text
		url: "/about/", // Link URL
		external: false, // Internal link
	},
};

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true, // 启用音乐播放器功能
};

/**
 * 侧边栏布局配置
 * 用于控制侧边栏组件的显示、排序、动画和响应式行为
 */
export const sidebarLayoutConfig: SidebarLayoutConfig = {
	// 是否启用侧边栏功能
	enable: true,

	// 侧边栏位置：左侧或右侧
	position: "left",

	// 侧边栏组件配置列表
	components: [
		{
			// 组件类型：用户资料组件
			type: "profile",
			// 是否启用该组件
			enable: true,
			// 组件显示顺序（数字越小越靠前）
			order: 1,
			// 组件位置："top" 表示固定在顶部
			position: "top",
			// CSS 类名，用于应用样式和动画
			class: "onload-animation",
			// 动画延迟时间（毫秒），用于错开动画效果
			animationDelay: 0,
		},
		{
			// 组件类型：公告组件
			type: "announcement",
			// 是否启用该组件（现在通过统一配置控制）
			enable: true,
			// 组件显示顺序
			order: 2,
			// 组件位置："top" 表示固定在顶部
			position: "top",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间
			animationDelay: 50,
		},
		{
			// 组件类型：分类组件
			type: "categories",
			// 是否启用该组件
			enable: true,
			// 组件显示顺序
			order: 3,
			// 组件位置："sticky" 表示粘性定位，可滚动
			position: "sticky",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间
			animationDelay: 150,
			// 响应式配置
			responsive: {
				// 折叠阈值：当分类数量超过5个时自动折叠
				collapseThreshold: 5,
			},
		},
		{
			// 组件类型：标签组件
			type: "tags",
			// 是否启用该组件
			enable: true,
			// 组件显示顺序
			order: 4,
			// 组件位置："sticky" 表示粘性定位
			position: "sticky",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间
			animationDelay: 200,
			// 响应式配置
			responsive: {
				// 折叠阈值：当标签数量超过20个时自动折叠
				collapseThreshold: 20,
			},
		},
	],

	// 默认动画配置
	defaultAnimation: {
		// 是否启用默认动画
		enable: true,
		// 基础延迟时间（毫秒）
		baseDelay: 0,
		// 递增延迟时间（毫秒），每个组件依次增加的延迟
		increment: 50,
	},

	// 响应式布局配置
	responsive: {
		// 断点配置（像素值）
		breakpoints: {
			// 移动端断点：屏幕宽度小于768px
			mobile: 768,
			// 平板端断点：屏幕宽度小于1024px
			tablet: 1024,
			// 桌面端断点：屏幕宽度小于1280px
			desktop: 1280,
		},
		// 不同设备的布局模式
		//hidden:不显示侧边栏 sidebar:显示侧边栏
		layout: {
			// 移动端：抽屉模式
			mobile: "sidebar",
			// 平板端：显示侧边栏
			tablet: "sidebar",
			// 桌面端：显示侧边栏
			desktop: "sidebar",
		},
	},
};

// 导出所有配置的统一接口
export const widgetConfigs = {
	profile: profileConfig,
	announcement: announcementConfig,
	music: musicPlayerConfig,
	layout: sidebarLayoutConfig,
} as const;
