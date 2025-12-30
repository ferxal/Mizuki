// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = {
	[categoryName: string]: Device[];
} & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	设备: [
		{
			name: "iQOO Z9 Turbo",
			image: "https://wwwstatic.vivo.com.cn/vivoportal/files/image/detail/20240419/e79cb47a0c36be5bcbd01aff105dc92b.png",
			specs: "青色 / 12G + 512GB",
			description: "搭载骁龙8s Gen 3处理器，80W快充，2K屏幕，配备独立显示芯片Turbo",
			link: "https://www.vivo.com.cn/vivo/iqooz9turbo/",
		},
		{
			name: "我的电脑",
			image: "/images/device/PC.png",
			specs: "R5 5600 + RTX 2080",
			description: "配置了AMD R5 5600处理器，七彩虹RTX 2080显卡，8GB x2 DDR4内存，存储空间共2.29TB",
			link: "",
		},
		{
			name: "我的服务器",
			image: "https://1panel.cn/images/logo-blue.png",
			specs: "i3 4160 + CMP 30HX",
			description: "配置了8GB DDR3内存，存储空间共120GB",
			link: "",
		}
	],

	外设: [
		{
			name: "狼蛛F3287无线键盘",
			image: "/images/device/JP.jpg",
			specs: "87键 蓝牙 / 2.4G",
			description:
				"",
			link: "",
		},
		{
			name: "罗技G102鼠标",
			image: "https://resource.logitechg.com/w_544,h_466,ar_7:6,c_pad,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/refreshed-g203/2025-update/g203-mouse-top-angle-blue-gallery-1.png",
			specs: "5个按键 RGB",
			description:
				"",
			link: "https://www.logitechg.com/zh-cn/shop/p/g102-lightsync-rgb-gaming-mouse",
		},
		{
			name: "高漫M6数位板",
			image: "https://proxy.chenhen.top/https://www.gaomon.cn/uploads/allimg/190611/1-1Z611162222.png",
			specs: "16384级压感",
			description:
				"触控环 + 12个硬快捷键+1个功能切换键+16个软快捷键",
			link: "https://www.logitechg.com/zh-cn/shop/p/g102-lightsync-rgb-gaming-mouse",
		},
	],
};
