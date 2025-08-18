import type {
	CommentConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	MusicPlayerConfig,
	NavBarConfig,
	ProfileConfig,
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
				"https://i0.hdslb.com/bfs/openplatform/88e4d7d77216cbd8018b7a761fbe3ebc8e4c3480.png@1500w.webp",
				"https://i0.hdslb.com/bfs/openplatform/575ce11089a773b84d904991f410b84f460d762f.png@1500w.webp",
				"https://i0.hdslb.com/bfs/openplatform/af7e274ee118ee4e6b7b999d9e09429fe53f0825.png@1500w.webp",
				"https://i0.hdslb.com/bfs/openplatform/1618858e6b9b28bb2f83dac7e040e639967aaafb.png@1500w.webp",
				"https://i0.hdslb.com/bfs/openplatform/ed8eaa7cbb9576d4807dd1d46a9086ac0ae7b171.png@1500w.webp",
			],
			mobile: [
				"https://i0.hdslb.com/bfs/openplatform/4d2a047d5bdd5425ea474a3cc8d457757b0bf3fc.png@1400w.webp",
				"https://i0.hdslb.com/bfs/openplatform/6f2ff5dafc9a3d3c7a4a02f0605b0f2be6eaad14.png@1400w.webp",
				"https://i0.hdslb.com/bfs/openplatform/84521ffeb80a00fb30cdf4a9e491c7ae05b0a78a.png@1400w.webp",
				"https://i0.hdslb.com/bfs/openplatform/e4049615f3c5eeb6d0706edad06c2ed01ed32485.png@1400w.webp",
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
			subtitle: ["记录技术","个人日记","我的备忘录","学习与交流"],
			typewriter: {
				enable: true, // 启用副标题打字机效果
				speed: 100, // 打字速度（毫秒）
				deleteSpeed: 50, // 删除速度（毫秒）
				pauseTime: 2000, // 完整显示后的暂停时间（毫秒）
			},
		},

		credit: {
			enable: true,
			text: "关于背景图",
			url: "",
		},
	},
	toc: {
		enable: true, // 启用目录功能
		depth: 3, // 修改为指定目录深度
	},
	favicon: [
		// 留空则使用默认favicon
				// Leave empty to use default favicon
		// {
		//   src: '/favicon/icon.png',    // Icon file path
		//   theme: 'light',              // Optional, specify theme 'light' | 'dark'
		//   sizes: '32x32',              // Optional, icon size
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		//LinkPreset.Friends,
		LinkPreset.Anime,
		//LinkPreset.Diary, // 添加日记菜单
//自定义链接格式：
//		{
//			name: "GitHub",
//			url: "https://github.com/matsuzaka-yuki",
//			external: true,
//		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "https://i0.hdslb.com/bfs/openplatform/c9c1d43e62d2159ccc375689a39be6bcdc58a42e.png@400w_400h.webp",
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
	enable: true, // Enable announcement feature
	title: "公告", // Announcement title
	content: "欢迎来到我的博客", // Announcement content
	closable: false, // Allow users to close the announcement
	link: {
		text: "了解更多", // Link text
		url: "/about/", // Link URL
		external: false, // Internal link
	},
};

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true, // Enable music player feature
};
