<script lang="ts">
// 导入 Svelte 的生命周期函数和过渡效果

// 导入 Icon 组件，用于显示图标
import Icon from "@iconify/svelte";
import { onDestroy, onMount } from "svelte";
import { slide } from "svelte/transition";
// 从配置文件中导入音乐播放器配置
import { musicPlayerConfig } from "../../config";
// 导入国际化相关的 Key 和 i18n 实例
import Key from "../../i18n/i18nKey";
import { i18n } from "../../i18n/translation";

// 音乐播放器模式，可选 "local" 或 "meting"，从本地配置中获取或使用默认值 "meting"
let mode = musicPlayerConfig.mode ?? "local";
// Meting API 地址，从配置中获取或使用默认地址(bilibili.uno(由哔哩哔哩松坂有希公益管理)),服务器在海外,部分音乐平台可能不支持并且速度可能慢,也可以自建Meting API
let meting_api =
	musicPlayerConfig.meting_api ??
	"https://meting.api.chenhen.top/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
// Meting API 的 ID，从配置中获取或使用默认值
let meting_id = musicPlayerConfig.id ?? "14164869977";
// Meting API 的服务器，从配置中获取或使用默认值,有的meting的api源支持更多平台,一般来说,netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
let meting_server = musicPlayerConfig.server ?? "netease";
// Meting API 的类型，从配置中获取或使用默认值
let meting_type = musicPlayerConfig.type ?? "playlist";
// 播放状态，默认为 false (未播放)
let isPlaying = false;
// 播放器是否展开，默认为 false
let isExpanded = true;
// 播放器是否隐藏，默认为 false
let isHidden = false;
// 是否显示播放列表，默认为 false
let showPlaylist = false;
// 当前播放时间，默认为 0
let currentTime = 0;
// 歌曲总时长，默认为 0
let duration = 0;
// 音量，默认为 0.7
let volume = 0.7;
// 是否静音，默认为 false
let isMuted = false;
// 是否正在加载，默认为 false
let isLoading = false;
// 是否随机播放，默认为 false
let isShuffled = false;
// 循环模式，0: 不循环, 1: 单曲循环, 2: 列表循环，默认为 0
let isRepeating = 2;
// 错误信息，默认为空字符串
let errorMessage = "";
// 是否显示错误信息，默认为 false
let showError = false;

// 当前歌曲信息
let currentSong = {
	title: "示例歌曲",
	artist: "示例艺术家",
	cover: "/favicon/icon_dark_192.ico",
	url: "",
	duration: 0,
};

let playlist = [];
let currentIndex = 0;
let audio: HTMLAudioElement;
let progressBar: HTMLElement;
let volumeBar: HTMLElement;

const localPlaylist = [
	{
		id: 1,
		title: "心予報",
		artist: "Eve",
		cover: "https://cdn-2.chenhen.top/音乐/心予報.webp",
		url: "https://cdn-2.chenhen.top/音乐/心予報.opus",
		duration: 200,
	},
	{
		id: 2,
		title: "踊っチャイナ",
		artist: "Atena/初音ミク/重音テト",
		cover: "https://cdn-2.chenhen.top/音乐/踊っチャイナ.webp",
		url: "https://cdn-2.chenhen.top/音乐/踊っチャイナ.opus",
		duration: 156,
	},
	{
		id: 3,
		title: "蝶に結いた赤い糸",
		artist: "《哭泣少女乐队》歌曲",
		cover: "https://cdn-2.chenhen.top/音乐/蝶に結いた赤い糸.webp",
		url: "https://cdn-2.chenhen.top/音乐/蝶に結いた赤い糸.opus",
		duration: 209,
	},
	{
		id: 4,
		title: "美少女無罪♡パイレーツ",
		artist: "宝鐘マリン",
		cover: "https://cdn-2.chenhen.top/音乐/美少女無罪♡パイレーツ.webp",
		url: "https://cdn-2.chenhen.top/音乐/美少女無罪♡パイレーツ.opus",
		duration: 219,
	},
	{
		id: 5,
		title: "置き論破",
		artist: "ぱりぱりさらうどん/重音テト/音街ウナ",
		cover: "https://cdn-2.chenhen.top/音乐/置き論破.webp",
		url: "https://cdn-2.chenhen.top/音乐/置き論破.opus",
		duration: 182,
	},
	{
		id: 6,
		title: "爆ぜて咲く",
		artist: "《哭泣少女乐队》歌曲",
		cover: "https://cdn-2.chenhen.top/音乐/爆ぜて咲く.webp",
		url: "https://cdn-2.chenhen.top/音乐/爆ぜて咲く.opus",
		duration: 221,
	},
	{
		id: 7,
		title: "温柔的回忆",
		artist: "《蔚蓝档案》最终章ED",
		cover: "https://cdn-2.chenhen.top/音乐/温柔的回忆.webp",
		url: "https://cdn-2.chenhen.top/音乐/温柔的回忆.opus",
		duration: 220,
	},
	{
		id: 8,
		title: "武装乙女",
		artist: "星尘infinity cover",
		cover: "https://cdn-2.chenhen.top/音乐/武装乙女.webp",
		url: "https://cdn-2.chenhen.top/音乐/武装乙女.opus",
		duration: 182,
	},
	{
		id: 9,
		title: "星球卑",
		artist: "闹闹丶/洛天依",
		cover: "https://cdn-2.chenhen.top/音乐/星球卑.webp",
		url: "https://cdn-2.chenhen.top/音乐/星球卑.opus",
		duration: 197,
	},
	{
		id: 10,
		title: "愛♡スクリ～ム！",
		artist: "AiScReam",
		cover: "https://cdn-2.chenhen.top/音乐/愛♡スクリ～ム！.webp",
		url: "https://cdn-2.chenhen.top/音乐/愛♡スクリ～ム！.opus",
		duration: 262,
	},
	{
		id: 11,
		title: "恋のうた",
		artist: "《总之就是非常可爱》OP",
		cover: "https://cdn-2.chenhen.top/音乐/恋のうた.webp",
		url: "https://cdn-2.chenhen.top/音乐/恋のうた.opus",
		duration: 91,
	},
	{
		id: 12,
		title: "怪獣",
		artist: "《怪兽8号》歌曲",
		cover: "https://cdn-2.chenhen.top/音乐/怪獣.webp",
		url: "https://cdn-2.chenhen.top/音乐/怪獣.opus",
		duration: 182,
	},
	{
		id: 13,
		title: "難聴系男子が倒せない",
		artist: "ラマーズP/鏡音リン",
		cover: "https://cdn-2.chenhen.top/音乐/難聴系男子が倒せない.webp",
		url: "https://cdn-2.chenhen.top/音乐/難聴系男子が倒せない.opus",
		duration: 264,
	},
	{
		id: 14,
		title: "彼女は旅に出る",
		artist: "鎖那",
		cover: "https://cdn-2.chenhen.top/音乐/彼女は旅に出る.webp",
		url: "https://cdn-2.chenhen.top/音乐/彼女は旅に出る.opus",
		duration: 220,
	},
	{
		id: 15,
		title: "影色舞",
		artist: "《MyGO》歌曲",
		cover: "https://cdn-2.chenhen.top/音乐/影色舞.webp",
		url: "https://cdn-2.chenhen.top/音乐/影色舞.opus",
		duration: 209,
	},
	{
		id: 16,
		title: "形",
		artist: "ずっと真夜中でいいのに。",
		cover: "https://cdn-2.chenhen.top/音乐/形.webp",
		url: "https://cdn-2.chenhen.top/音乐/形.opus",
		duration: 200,
	},
	{
		id: 17,
		title: "女の子になりたい",
		artist: "まふまふ",
		cover: "https://cdn-2.chenhen.top/音乐/女の子になりたい.webp",
		url: "https://cdn-2.chenhen.top/音乐/女の子になりたい.opus",
		duration: 238,
	},
	{
		id: 18,
		title: "味噌汁とバター",
		artist: "《时光流逝 饭菜已经美味》ED",
		cover: "https://cdn-2.chenhen.top/音乐/味噌汁とバター.webp",
		url: "https://cdn-2.chenhen.top/音乐/味噌汁とバター.opus",
		duration: 232,
	},
	{
		id: 19,
		title: "勘冴えて悔しいわ",
		artist: "ずっと真夜中でいいのに。",
		cover: "https://cdn-2.chenhen.top/音乐/勘冴えて悔しいわ.webp",
		url: "https://cdn-2.chenhen.top/音乐/勘冴えて悔しいわ.opus",
		duration: 238,
	},
	{
		id: 20,
		title: "勘ぐれい",
		artist: "ずっと真夜中でいいのに。",
		cover: "https://cdn-2.chenhen.top/音乐/勘ぐれい.webp",
		url: "https://cdn-2.chenhen.top/音乐/勘ぐれい.opus",
		duration: 249,
	},
	{
		id: 21,
		title: "刹那の誓い",
		artist: "《总之就是非常可爱 第二季》OP",
		cover: "https://cdn-2.chenhen.top/音乐/刹那の誓い.webp",
		url: "https://cdn-2.chenhen.top/音乐/刹那の誓い.opus",
		duration: 220,
	},
	{
		id: 22,
		title: "全部壊しちゃえ！",
		artist: "柏木カレキ",
		cover: "https://cdn-2.chenhen.top/音乐/全部壊しちゃえ！.webp",
		url: "https://cdn-2.chenhen.top/音乐/全部壊しちゃえ！.opus",
		duration: 162,
	},
	{
		id: 23,
		title: "克隆克隆",
		artist: "Atena/GUMI/鏡音リン",
		cover: "https://cdn-2.chenhen.top/音乐/克隆克隆.webp",
		url: "https://cdn-2.chenhen.top/音乐/克隆克隆.opus",
		duration: 145,
	},
	{
		id: 24,
		title: "乙女はサイコパス",
		artist: "P丸様。/コレサワ",
		cover: "https://cdn-2.chenhen.top/音乐/乙女はサイコパス.webp",
		url: "https://cdn-2.chenhen.top/音乐/乙女はサイコパス.opus",
		duration: 246,
	},
	{
		id: 25,
		title: "ワンルームシュガーライフ",
		artist: "《砂糖的幸福生活》OP",
		cover: "https://cdn-2.chenhen.top/音乐/ワンルームシュガーライフ.webp",
		url: "https://cdn-2.chenhen.top/音乐/ワンルームシュガーライフ.opus",
		duration: 166,
	},
	{
		id: 26,
		title: "レインコート",
		artist: "柏木カレキ/雨衣",
		cover: "https://cdn-2.chenhen.top/音乐/レインコート.webp",
		url: "https://cdn-2.chenhen.top/音乐/レインコート.opus",
		duration: 239,
	},
	{
		id: 27,
		title: "「リテラチュア」魔女之旅op",
		artist: "《魔女之旅》OP",
		cover: "https://cdn-2.chenhen.top/音乐/「リテラチュア」魔女之旅op.webp",
		url: "https://cdn-2.chenhen.top/音乐/「リテラチュア」魔女之旅op.opus",
		duration: 90,
	},
	{
		id: 28,
		title: "ライアーメイデン",
		artist: "ヤバス/りぃふ",
		cover: "https://cdn-2.chenhen.top/音乐/ライアーメイデン.webp",
		url: "https://cdn-2.chenhen.top/音乐/ライアーメイデン.opus",
		duration: 150,
	},
	{
		id: 29,
		title: "モニタリング",
		artist: "DECO*27/初音ミク",
		cover: "https://cdn-2.chenhen.top/音乐/モニタリング.webp",
		url: "https://cdn-2.chenhen.top/音乐/モニタリング.opus",
		duration: 176,
	},
	{
		id: 30,
		title: "ムリムリ進化論",
		artist: "《我怎么可能成为你的恋人，不行不行！》OP",
		cover: "https://cdn-2.chenhen.top/音乐/ムリムリ進化論.webp",
		url: "https://cdn-2.chenhen.top/音乐/ムリムリ進化論.opus",
		duration: 195,
	},
	{
		id: 31,
		title: "ミィハー",
		artist: "Chinozo/重音テト",
		cover: "https://cdn-2.chenhen.top/音乐/ミィハー.webp",
		url: "https://cdn-2.chenhen.top/音乐/ミィハー.opus",
		duration: 179,
	},
	{
		id: 32,
		title: "ミィハー (self cover)",
		artist: "Chinozo",
		cover: "https://cdn-2.chenhen.top/音乐/ミィハー (self cover).webp",
		url: "https://cdn-2.chenhen.top/音乐/ミィハー (self cover).opus",
		duration: 179,
	},
	{
		id: 33,
		title: "ブランディングができない",
		artist: "Chinozo",
		cover: "https://cdn-2.chenhen.top/音乐/ブランディングができない.webp",
		url: "https://cdn-2.chenhen.top/音乐/ブランディングができない.opus",
		duration: 151,
	},
	{
		id: 34,
		title: "ビビデバ",
		artist: "星街すいせい",
		cover: "https://cdn-2.chenhen.top/音乐/ビビデバ.webp",
		url: "https://cdn-2.chenhen.top/音乐/ビビデバ.opus",
		duration: 165,
	},
	{
		id: 35,
		title: "ハローセカイ",
		artist: "初音ミク/DECO*27",
		cover: "https://cdn-2.chenhen.top/音乐/ハローセカイ.webp",
		url: "https://cdn-2.chenhen.top/音乐/ハローセカイ.opus",
		duration: 162,
	},
	{
		id: 36,
		title: "デビルじゃないもん",
		artist: "DECO*27/ピノキオピー/初音ミク",
		cover: "https://cdn-2.chenhen.top/音乐/デビルじゃないもん.webp",
		url: "https://cdn-2.chenhen.top/音乐/デビルじゃないもん.opus",
		duration: 163,
	},
	{
		id: 37,
		title: "テレパシ",
		artist: "DECO*27/初音ミク",
		cover: "https://cdn-2.chenhen.top/音乐/テレパシ.webp",
		url: "https://cdn-2.chenhen.top/音乐/テレパシ.opus",
		duration: 137,
	},
	{
		id: 38,
		title: "テトリス",
		artist: "柊マグネタイト/重音テト",
		cover: "https://cdn-2.chenhen.top/音乐/テトリス.webp",
		url: "https://cdn-2.chenhen.top/音乐/テトリス.opus",
		duration: 142,
	},
	{
		id: 39,
		title: "チェリーポップ",
		artist: "DECO*27",
		cover: "https://cdn-2.chenhen.top/音乐/チェリーポップ.webp",
		url: "https://cdn-2.chenhen.top/音乐/チェリーポップ.opus",
		duration: 138,
	},
	{
		id: 40,
		title: "ステレオフォニック",
		artist: "鹿乃",
		cover: "https://cdn-2.chenhen.top/音乐/ステレオフォニック.webp",
		url: "https://cdn-2.chenhen.top/音乐/ステレオフォニック.opus",
		duration: 237,
	},
	{
		id: 41,
		title: "シル・ヴ・プレジデント",
		artist: "P丸様。/ナナホシ管弦楽団",
		cover: "https://cdn-2.chenhen.top/音乐/シル・ヴ・プレジデント.webp",
		url: "https://cdn-2.chenhen.top/音乐/シル・ヴ・プレジデント.opus",
		duration: 190,
	},
	{
		id: 42,
		title: "エリート (self cover)",
		artist: "Chinozo",
		cover: "https://cdn-2.chenhen.top/音乐/エリート (self cover).webp",
		url: "https://cdn-2.chenhen.top/音乐/エリート (self cover).opus",
		duration: 168,
	},
	{
		id: 43,
		title: "インドア系ならトラックメイカー",
		artist: "Yunomi/nicamoq",
		cover: "https://cdn-2.chenhen.top/音乐/インドア系ならトラックメイカー.webp",
		url: "https://cdn-2.chenhen.top/音乐/インドア系ならトラックメイカー.opus",
		duration: 197,
	},
	{
		id: 44,
		title: "アンチユー",
		artist: "Chinozo",
		cover: "https://cdn-2.chenhen.top/音乐/アンチユー.webp",
		url: "https://cdn-2.chenhen.top/音乐/アンチユー.opus",
		duration: 206,
	},
	{
		id: 45,
		title: "アリア",
		artist: "ナナツカゼ",
		cover: "https://cdn-2.chenhen.top/音乐/アリア.webp",
		url: "https://cdn-2.chenhen.top/音乐/アリア.opus",
		duration: 226,
	},
	{
		id: 46,
		title: "アイドル",
		artist: "《我推的孩子》OP",
		cover: "https://cdn-2.chenhen.top/音乐/アイドル.webp",
		url: "https://cdn-2.chenhen.top/音乐/アイドル.opus",
		duration: 213,
	},
	{
		id: 47,
		title: "アイデン貞貞メルトダウン",
		artist: "《别当欧尼酱了》OP",
		cover: "https://cdn-2.chenhen.top/音乐/アイデン貞貞メルトダウン.webp",
		url: "https://cdn-2.chenhen.top/音乐/アイデン貞貞メルトダウン.opus",
		duration: 243,
	},
	{
		id: 48,
		title: "ふわふわ♪",
		artist: "牧野由依",
		cover: "https://cdn-2.chenhen.top/音乐/ふわふわ♪.webp",
		url: "https://cdn-2.chenhen.top/音乐/ふわふわ♪.opus",
		duration: 286,
	},
	{
		id: 49,
		title: "ふわふわ",
		artist: "HELLO OSAKA/ウメ CV 羊宮 妃那/羊宮妃那",
		cover: "https://cdn-2.chenhen.top/音乐/ふわふわ.webp",
		url: "https://cdn-2.chenhen.top/音乐/ふわふわ.opus",
		duration: 203,
	},
	{
		id: 50,
		title: "ふたりのスタートボタン",
		artist: "《与游戏中心的少女异文化交流的故事》OP",
		cover: "https://cdn-2.chenhen.top/音乐/ふたりのスタートボタン.webp",
		url: "https://cdn-2.chenhen.top/音乐/ふたりのスタートボタン.opus",
		duration: 225,
	},
	{
		id: 51,
		title: "ひっひっふー",
		artist: "时雨羽衣",
		cover: "https://cdn-2.chenhen.top/音乐/ひっひっふー.webp",
		url: "https://cdn-2.chenhen.top/音乐/ひっひっふー.opus",
		duration: 164,
	},
	{
		id: 52,
		title: "ときめきブローカー",
		artist: "P丸様。",
		cover: "https://cdn-2.chenhen.top/音乐/ときめきブローカー.webp",
		url: "https://cdn-2.chenhen.top/音乐/ときめきブローカー.opus",
		duration: 204,
	},
	{
		id: 53,
		title: "ちっちゃな私",
		artist: "重音テト/マサラダ",
		cover: "https://cdn-2.chenhen.top/音乐/ちっちゃな私.webp",
		url: "https://cdn-2.chenhen.top/音乐/ちっちゃな私.opus",
		duration: 231,
	},
	{
		id: 54,
		title: "ちきゅう大爆発",
		artist: "P丸様。",
		cover: "https://cdn-2.chenhen.top/音乐/ちきゅう大爆発.webp",
		url: "https://cdn-2.chenhen.top/音乐/ちきゅう大爆発.opus",
		duration: 193,
	},
	{
		id: 55,
		title: "だまってちゃん",
		artist: "Chinozo",
		cover: "https://cdn-2.chenhen.top/音乐/だまってちゃん.webp",
		url: "https://cdn-2.chenhen.top/音乐/だまってちゃん.opus",
		duration: 141,
	},
	{
		id: 56,
		title: "所以我放弃了音乐",
		artist: "ヨルシカ",
		cover: "https://cdn-2.chenhen.top/音乐/だから僕は音楽を辞めた.webp",
		url: "https://cdn-2.chenhen.top/音乐/だから僕は音楽を辞めた.opus",
		duration: 242,
	},
	{
		id: 57,
		title: "そんなもんね",
		artist: "《时光流逝 饭菜已经美味》OP",

		cover: "https://cdn-2.chenhen.top/音乐/そんなもんね.webp",
		url: "https://cdn-2.chenhen.top/音乐/そんなもんね.opus",
		duration: 180,
	},
	{
		id: 58,
		title: "お返事まだカナ？おじさん構文！",
		artist: "吉本おじさん/时雨羽衣",
		cover: "https://cdn-2.chenhen.top/音乐/お返事まだカナ？おじさん構文！.webp",
		url: "https://cdn-2.chenhen.top/音乐/お返事まだカナ？おじさん構文！.opus",
		duration: 184,
	},
	{
		id: 59,
		title: "あいつら全員同窓会",
		artist: "ずっと真夜中でいいのに。",
		cover: "https://cdn-2.chenhen.top/音乐/あいつら全員同窓会.webp",
		url: "https://cdn-2.chenhen.top/音乐/あいつら全員同窓会.opus",
		duration: 254,
	},
	{
		id: 60,
		title: "Utopia or Dystopia",
		artist: "《拔作岛》OP",
		cover: "https://cdn-2.chenhen.top/音乐/Utopia or Dystopia.webp",
		url: "https://cdn-2.chenhen.top/音乐/Utopia or Dystopia.opus",
		duration: 191,
	},
	{
		id: 61,
		title: "万众瞩目",
		artist: "CS2 音乐盒",
		cover: "https://cdn-2.chenhen.top/音乐/Under Bright Lights.webp",
		url: "https://cdn-2.chenhen.top/音乐/Under Bright Lights.opus",
		duration: 228,
	},
	{
		id: 62,
		title: "T氏の話を信じるな",
		artist: "ピノキオピー/初音ミク/重音テト",
		cover: "https://cdn-2.chenhen.top/音乐/T氏の話を信じるな.webp",
		url: "https://cdn-2.chenhen.top/音乐/T氏の話を信じるな.opus",
		duration: 163,
	},
	{
		id: 63,
		title: "SWEET HURT",
		artist: "《砂糖的幸福生活》ED",
		cover: "https://cdn-2.chenhen.top/音乐/SWEET HURT.webp",
		url: "https://cdn-2.chenhen.top/音乐/SWEET HURT.opus",
		duration: 277,
	},
	{
		id: 64,
		title: "Please,Take On Me",
		artist: "《中二病也要谈恋爱 剧场版》插曲",
		cover: "https://cdn-2.chenhen.top/音乐/Please Take On Me.webp",
		url: "https://cdn-2.chenhen.top/音乐/Please Take On Me.opus",
		duration: 270,
	},
	{
		id: 65,
		title: "Nobody",
		artist: "《怪兽8号》ED",
		cover: "https://cdn-2.chenhen.top/音乐/Nobody.webp",
		url: "https://cdn-2.chenhen.top/音乐/Nobody.opus",
		duration: 153,
	},
	{
		id: 66,
		title: "MOTTAI",
		artist: "P丸様。",
		cover: "https://cdn-2.chenhen.top/音乐/MOTTAI.webp",
		url: "https://cdn-2.chenhen.top/音乐/MOTTAI.opus",
		duration: 160,
	},
	{
		id: 67,
		title: "Misty Memory (Night Version)",
		artist: "《明日方舟》歌曲",
		cover: "https://cdn-2.chenhen.top/音乐/Misty Memory (Night Version).webp",
		url: "https://cdn-2.chenhen.top/音乐/Misty Memory (Night Version).opus",
		duration: 242,
	},
	{
		id: 68,
		title: "Misty Memory (Day Version)",
		artist: "《明日方舟》歌曲",
		cover: "https://cdn-2.chenhen.top/音乐/Misty Memory (Day Version).webp",
		url: "https://cdn-2.chenhen.top/音乐/Misty Memory (Day Version).opus",
		duration: 283,
	},
	{
		id: 69,
		title: "MAO",
		artist: "洛天依/神山羊",
		cover: "https://cdn-2.chenhen.top/音乐/MAO.webp",
		url: "https://cdn-2.chenhen.top/音乐/MAO.opus",
		duration: 195,
	},
	{
		id: 70,
		title: "Lockdown",
		artist: "PIKASONIC/Tatsunoshin/Neona",
		cover: "https://cdn-2.chenhen.top/音乐/Lockdown.webp",
		url: "https://cdn-2.chenhen.top/音乐/Lockdown.opus",
		duration: 209,
	},
	{
		id: 71,
		title: "LEveL",
		artist: "《我独自升级》OP",
		cover: "https://cdn-2.chenhen.top/音乐/LEveL.webp",
		url: "https://cdn-2.chenhen.top/音乐/LEveL.opus",
		duration: 180,
	},
	{
		id: 72,
		title: "INTERNET OVERDOSE",
		artist: "NEEDY GIRL OVERDOSE/KOTOKO/Aiobahn",
		cover: "https://cdn-2.chenhen.top/音乐/INTERNET OVERDOSE.webp",
		url: "https://cdn-2.chenhen.top/音乐/INTERNET OVERDOSE.opus",
		duration: 220,
	},
	{
		id: 73,
		title: "BOW AND ARROW",
		artist: "《金牌得主》OP",
		cover: "https://cdn-2.chenhen.top/音乐/BOW AND ARROW.webp",
		url: "https://cdn-2.chenhen.top/音乐/BOW AND ARROW.opus",
		duration: 175,
	},
	{
		id: 74,
		title: "Abyss",
		artist: "《怪兽8号》OP",
		cover: "https://cdn-2.chenhen.top/音乐/Abyss (from Kaiju No. 8).webp",
		url: "https://cdn-2.chenhen.top/音乐/Abyss (from Kaiju No. 8).opus",
		duration: 123,
	},
];

async function fetchMetingPlaylist() {
	if (!meting_api || !meting_id) return;
	isLoading = true;
	const apiUrl = meting_api
		.replace(":server", meting_server)
		.replace(":type", meting_type)
		.replace(":id", meting_id)
		.replace(":auth", "")
		.replace(":r", Date.now().toString());
	try {
		const res = await fetch(apiUrl);
		if (!res.ok) throw new Error("meting api error");
		const list = await res.json();
		playlist = list.map((song) => {
			let title = song.name ?? song.title ?? "未知歌曲";
			let artist = song.artist ?? song.author ?? "未知艺术家";
			let dur = song.duration ?? 0;
			if (dur > 10000) dur = Math.floor(dur / 1000);
			if (!Number.isFinite(dur) || dur <= 0) dur = 0;
			return {
				id: song.id,
				title,
				artist,
				cover: song.pic ?? "",
				url: song.url ?? "",
				duration: dur,
			};
		});
		if (playlist.length > 0) {
			loadSong(playlist[0]);
		}
		isLoading = false;
	} catch (e) {
		showErrorMessage("Meting 歌单获取失败");
		isLoading = false;
	}
}

function togglePlay() {
	if (!audio || !currentSong.url) return;
	if (isPlaying) {
		audio.pause();
	} else {
		audio.play();
	}
}

function toggleExpanded() {
	isExpanded = !isExpanded;
	if (isExpanded) {
		showPlaylist = false;
		isHidden = false;
	}
}

function toggleHidden() {
	isHidden = !isHidden;
	if (isHidden) {
		isExpanded = false;
		showPlaylist = false;
	}
}

function togglePlaylist() {
	showPlaylist = !showPlaylist;
}

function toggleShuffle() {
	isShuffled = !isShuffled;
}

function toggleRepeat() {
	isRepeating = (isRepeating + 1) % 3;
}

function previousSong() {
	if (playlist.length <= 1) return;
	const newIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
	playSong(newIndex);
}

function nextSong() {
	if (playlist.length <= 1) return;
	let newIndex: number;
	if (isShuffled) {
		do {
			newIndex = Math.floor(Math.random() * playlist.length);
		} while (newIndex === currentIndex && playlist.length > 1);
	} else {
		newIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
	}
	playSong(newIndex);
}

function playSong(index: number) {
	if (index < 0 || index >= playlist.length) return;
	const wasPlaying = isPlaying;
	currentIndex = index;
	if (audio) audio.pause();
	loadSong(playlist[currentIndex]);
	if (wasPlaying || !isPlaying) {
		setTimeout(() => {
			if (!audio) return;
			if (audio.readyState >= 2) {
				audio.play().catch(() => {});
			} else {
				audio.addEventListener(
					"canplay",
					() => {
						audio.play().catch(() => {});
					},
					{ once: true },
				);
			}
		}, 100);
	}
}

function getAssetPath(path: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) return path;
	if (path.startsWith("/")) return path;
	return `/${path}`;
}

function loadSong(song: typeof currentSong) {
	if (!song || !audio) return;
	currentSong = { ...song };
	if (song.url) {
		isLoading = true;
		audio.pause();
		audio.currentTime = 0;
		currentTime = 0;
		duration = song.duration ?? 0;
		audio.removeEventListener("loadeddata", handleLoadSuccess);
		audio.removeEventListener("error", handleLoadError);
		audio.removeEventListener("loadstart", handleLoadStart);
		audio.addEventListener("loadeddata", handleLoadSuccess, { once: true });
		audio.addEventListener("error", handleLoadError, { once: true });
		audio.addEventListener("loadstart", handleLoadStart, { once: true });
		audio.src = getAssetPath(song.url);
		audio.load();
	} else {
		isLoading = false;
	}
}

function handleLoadSuccess() {
	isLoading = false;
	if (audio?.duration && audio.duration > 1) {
		duration = Math.floor(audio.duration);
		if (playlist[currentIndex]) playlist[currentIndex].duration = duration;
		currentSong.duration = duration;
	}
}

function handleLoadError(event: Event) {
	isLoading = false;
	showErrorMessage(`无法播放 "${currentSong.title}"，正在尝试下一首...`);
	if (playlist.length > 1) setTimeout(() => nextSong(), 1000);
	else showErrorMessage("播放列表中没有可用的歌曲");
}

function handleLoadStart() {}

function showErrorMessage(message: string) {
	errorMessage = message;
	showError = true;
	setTimeout(() => {
		showError = false;
	}, 3000);
}
function hideError() {
	showError = false;
}

function setProgress(event: MouseEvent) {
	if (!audio || !progressBar) return;
	const rect = progressBar.getBoundingClientRect();
	const percent = (event.clientX - rect.left) / rect.width;
	const newTime = percent * duration;
	audio.currentTime = newTime;
	currentTime = newTime;
}

function setVolume(event: MouseEvent) {
	if (!audio || !volumeBar) return;
	const rect = volumeBar.getBoundingClientRect();
	const percent = Math.max(
		0,
		Math.min(1, (event.clientX - rect.left) / rect.width),
	);
	volume = percent;
	audio.volume = volume;
	isMuted = volume === 0;
}

function toggleMute() {
	if (!audio) return;
	isMuted = !isMuted;
	audio.muted = isMuted;
}

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function handleAudioEvents() {
	if (!audio) return;
	audio.addEventListener("play", () => {
		isPlaying = true;
	});
	audio.addEventListener("pause", () => {
		isPlaying = false;
	});
	audio.addEventListener("timeupdate", () => {
		currentTime = audio.currentTime;
	});
	audio.addEventListener("ended", () => {
		if (isRepeating === 1) {
			audio.currentTime = 0;
			audio.play().catch(() => {});
		} else if (
			isRepeating === 2 ||
			currentIndex < playlist.length - 1 ||
			isShuffled
		) {
			nextSong();
		} else {
			isPlaying = false;
		}
	});
	audio.addEventListener("error", (event) => {
		isLoading = false;
	});
	audio.addEventListener("stalled", () => {});
	audio.addEventListener("waiting", () => {});
}

onMount(() => {
	audio = new Audio();
	audio.volume = volume;
	handleAudioEvents();
	if (mode === "meting") {
		fetchMetingPlaylist();
	} else {
		playlist = localPlaylist;
		if (playlist.length > 0) loadSong(playlist[0]);
	}
});

onDestroy(() => {
	if (audio) {
		audio.pause();
		audio.src = "";
	}
});
</script>

{#if musicPlayerConfig.enable}
{#if showError}
<div class="fixed bottom-20 left-4 z-[60] max-w-sm">
    <div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
        <Icon icon="material-symbols:error" class="text-xl flex-shrink-0" />
        <span class="text-sm flex-1">{errorMessage}</span>
        <button on:click={hideError} class="text-white/80 hover:text-white transition-colors">
            <Icon icon="material-symbols:close" class="text-lg" />
        </button>
    </div>
</div>
{/if}

<div class="music-player fixed bottom-4 left-4 z-50 transition-all duration-300 ease-in-out"
     class:expanded={isExpanded}
     class:hidden-mode={isHidden}>
    <!-- 隐藏状态的小圆球 -->
    <div class="orb-player w-12 h-12 bg-[var(--primary)] rounded-full shadow-lg cursor-pointer transition-all duration-500 ease-in-out flex items-center justify-center hover:scale-110 active:scale-95"
         class:opacity-0={!isHidden}
         class:scale-0={!isHidden}
         class:pointer-events-none={!isHidden}
         on:click={toggleHidden}
         on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleHidden();
            }
         }}
         role="button"
         tabindex="0"
         aria-label="显示音乐播放器">
        {#if isLoading}
            <Icon icon="eos-icons:loading" class="text-white text-lg" />
        {:else if isPlaying}
            <div class="flex space-x-0.5">
                <div class="w-0.5 h-3 bg-white rounded-full animate-pulse"></div>
                <div class="w-0.5 h-4 bg-white rounded-full animate-pulse" style="animation-delay: 150ms;"></div>
                <div class="w-0.5 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 300ms;"></div>
            </div>
        {:else}
            <Icon icon="material-symbols:music-note" class="text-white text-lg" />
        {/if}
    </div>
    <!-- 收缩状态的迷你播放器（封面圆形） -->
    <div class="mini-player card-base bg-[var(--float-panel-bg)] shadow-xl rounded-2xl p-3 transition-all duration-500 ease-in-out"
         class:opacity-0={isExpanded || isHidden}
         class:scale-95={isExpanded || isHidden}
         class:pointer-events-none={isExpanded || isHidden}
         on:click={toggleExpanded}
         on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpanded();
            }
         }}
         role="button"
         tabindex="0"
         aria-label="展开音乐播放器">
        <div class="flex items-center gap-3 cursor-pointer">
            <div class="cover-container relative w-12 h-12 rounded-full overflow-hidden">
                <img src={getAssetPath(currentSong.cover)} alt="封面"
                     class="w-full h-full object-cover transition-transform duration-300"
                     class:animate-spin={isPlaying && !isLoading}
                     class:animate-pulse={isLoading} />
                <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    {#if isLoading}
                        <Icon icon="eos-icons:loading" class="text-white text-xl" />
                    {:else if isPlaying}
                        <Icon icon="material-symbols:pause" class="text-white text-xl" />
                    {:else}
                        <Icon icon="material-symbols:play-arrow" class="text-white text-xl" />
                    {/if}
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-90 truncate">{currentSong.title}</div>
                <div class="text-xs text-50 truncate">{currentSong.artist}</div>
            </div>
            <div class="flex items-center gap-1">
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"
                        on:click|stopPropagation={toggleHidden}
                        title="隐藏播放器">
                    <Icon icon="material-symbols:visibility-off" class="text-lg" />
                </button>
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"
                        on:click|stopPropagation={toggleExpanded}>
                    <Icon icon="material-symbols:expand-less" class="text-lg" />
                </button>
            </div>
        </div>
    </div>
    <!-- 展开状态的完整播放器（封面圆形） -->
    <div class="expanded-player card-base bg-[var(--float-panel-bg)] shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out"
         class:opacity-0={!isExpanded}
         class:scale-95={!isExpanded}
         class:pointer-events-none={!isExpanded}>
        <div class="flex items-center gap-4 mb-4">
            <div class="cover-container relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img src={getAssetPath(currentSong.cover)} alt="封面"
                     class="w-full h-full object-cover transition-transform duration-300"
                     class:animate-spin={isPlaying && !isLoading}
                     class:animate-pulse={isLoading} />
            </div>
            <div class="flex-1 min-w-0">
                <div class="song-title text-lg font-bold text-90 truncate mb-1">{currentSong.title}</div>
                <div class="song-artist text-sm text-50 truncate">{currentSong.artist}</div>
                <div class="text-xs text-30 mt-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
            <div class="flex items-center gap-1">
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"
                        on:click={toggleHidden}
                        title="隐藏播放器">
                    <Icon icon="material-symbols:visibility-off" class="text-lg" />
                </button>
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"
                        on:click={toggleExpanded}>
                    <Icon icon="material-symbols:expand-more" class="text-lg" />
                </button>
            </div>
        </div>
        <div class="progress-section mb-4">
            <div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer"
                 bind:this={progressBar}
                 on:click={setProgress}
                 on:keydown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         const rect = progressBar.getBoundingClientRect();
                         const percent = 0.5;
                         const newTime = percent * duration;
                         if (audio) {
                             audio.currentTime = newTime;
                             currentTime = newTime;
                         }
                     }
                 }}
                 role="slider"
                 tabindex="0"
                 aria-label="播放进度"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-valuenow={duration > 0 ? (currentTime / duration * 100) : 0}>
                <div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"
                     style="width: {duration > 0 ? (currentTime / duration) * 100 : 0}%"></div>
            </div>
        </div>
        <div class="controls flex items-center justify-center gap-2 mb-4">
            <!-- 随机按钮高亮 -->
            <button class="w-10 h-10 rounded-lg"
                    class:btn-regular={isShuffled}
                    class:btn-plain={!isShuffled}
                    on:click={toggleShuffle}
                    disabled={playlist.length <= 1}>
                <Icon icon="material-symbols:shuffle" class="text-lg" />
            </button>
            <button class="btn-plain w-10 h-10 rounded-lg" on:click={previousSong}
                    disabled={playlist.length <= 1}>
                <Icon icon="material-symbols:skip-previous" class="text-xl" />
            </button>
            <button class="btn-regular w-12 h-12 rounded-full"
                    class:opacity-50={isLoading}
                    disabled={isLoading}
                    on:click={togglePlay}>
                {#if isLoading}
                    <Icon icon="eos-icons:loading" class="text-xl" />
                {:else if isPlaying}
                    <Icon icon="material-symbols:pause" class="text-xl" />
                {:else}
                    <Icon icon="material-symbols:play-arrow" class="text-xl" />
                {/if}
            </button>
            <button class="btn-plain w-10 h-10 rounded-lg" on:click={nextSong}
                    disabled={playlist.length <= 1}>
                <Icon icon="material-symbols:skip-next" class="text-xl" />
            </button>
            <!-- 循环按钮高亮 -->
            <button class="w-10 h-10 rounded-lg"
                    class:btn-regular={isRepeating > 0}
                    class:btn-plain={isRepeating === 0}
                    on:click={toggleRepeat}>
                {#if isRepeating === 1}
                    <Icon icon="material-symbols:repeat-one" class="text-lg" />
                {:else if isRepeating === 2}
                    <Icon icon="material-symbols:repeat" class="text-lg" />
                {:else}
                    <Icon icon="material-symbols:repeat" class="text-lg opacity-50" />
                {/if}
            </button>
        </div>
        <div class="bottom-controls flex items-center gap-2">
            <button class="btn-plain w-8 h-8 rounded-lg" on:click={toggleMute}>
                {#if isMuted || volume === 0}
                    <Icon icon="material-symbols:volume-off" class="text-lg" />
                {:else if volume < 0.5}
                    <Icon icon="material-symbols:volume-down" class="text-lg" />
                {:else}
                    <Icon icon="material-symbols:volume-up" class="text-lg" />
                {/if}
            </button>
            <div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer"
                 bind:this={volumeBar}
                 on:click={setVolume}
                 on:keydown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         if (e.key === 'Enter') toggleMute();
                     }
                 }}
                 role="slider"
                 tabindex="0"
                 aria-label="音量控制"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-valuenow={volume * 100}>
                <div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"
                     style="width: {volume * 100}%"></div>
            </div>
            <button class="btn-plain w-8 h-8 rounded-lg"
                    class:text-[var(--primary)]={showPlaylist}
                    on:click={togglePlaylist}>
                <Icon icon="material-symbols:queue-music" class="text-lg" />
            </button>
        </div>
    </div>
    {#if showPlaylist}
        <div class="playlist-panel float-panel fixed bottom-20 left-4 w-80 max-h-96 overflow-hidden z-50"
             transition:slide={{ duration: 300, axis: 'y' }}>
            <div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]">
                <h3 class="text-lg font-semibold text-90">{i18n(Key.playlist)}</h3>
                <button class="btn-plain w-8 h-8 rounded-lg" on:click={togglePlaylist}>
                    <Icon icon="material-symbols:close" class="text-lg" />
                </button>
            </div>
            <div class="playlist-content overflow-y-auto max-h-80">
                {#each playlist as song, index}
                    <div class="playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors"
                         class:bg-[var(--btn-plain-bg)]={index === currentIndex}
                         class:text-[var(--primary)]={index === currentIndex}
                         on:click={() => playSong(index)}
                         on:keydown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                                 e.preventDefault();
                                 playSong(index);
                             }
                         }}
                         role="button"
                         tabindex="0"
                         aria-label="播放 {song.title} - {song.artist}">
                        <div class="w-6 h-6 flex items-center justify-center">
                            {#if index === currentIndex && isPlaying}
                                <Icon icon="material-symbols:graphic-eq" class="text-[var(--primary)] animate-pulse" />
                            {:else if index === currentIndex}
                                <Icon icon="material-symbols:pause" class="text-[var(--primary)]" />
                            {:else}
                                <span class="text-sm text-[var(--content-meta)]">{index + 1}</span>
                            {/if}
                        </div>
                        <!-- 歌单列表内封面仍为圆角矩形 -->
                        <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0">
                            <img src={getAssetPath(song.cover)} alt={song.title} class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-medium truncate" class:text-[var(--primary)]={index === currentIndex} class:text-90={index !== currentIndex}>
                                {song.title}
                            </div>
                            <div class="text-sm text-[var(--content-meta)] truncate" class:text-[var(--primary)]={index === currentIndex}>
                                {song.artist}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
.orb-player {
	position: relative;
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
}
.orb-player::before {
	content: '';
	position: absolute;
	inset: -2px;
	background: linear-gradient(45deg, var(--primary), transparent, var(--primary));
	border-radius: 50%;
	z-index: -1;
	opacity: 0;
	transition: opacity 0.3s ease;
}
.orb-player:hover::before {
	opacity: 0.3;
	animation: rotate 2s linear infinite;
}
.orb-player .animate-pulse {
	animation: musicWave 1.5s ease-in-out infinite;
}
@keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
@keyframes musicWave {
	0%, 100% { transform: scaleY(0.5); }
	50% { transform: scaleY(1); }
}
.music-player.hidden-mode {
	width: 48px;
	height: 48px;
}
.music-player {
    max-width: 320px;
    user-select: none;
}
.mini-player {
    width: 280px;
    position: absolute;
    bottom: 0;
    left: 0;
}
.expanded-player {
    width: 320px;
}
.cover-container img.animate-spin {
    animation: spin 3s linear infinite;
}
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
.progress-section div:hover,
.bottom-controls > div:hover {
    transform: scaleY(1.2);
    transition: transform 0.2s ease;
}
@media (max-width: 768px) {
    .music-player {
        max-width: 280px;
        left: 8px !important;
        bottom: 8px !important;
    }
    .music-player.expanded {
        width: calc(100vw - 16px);
        max-width: none;
        left: 8px !important;
        right: 8px !important;
    }
    .playlist-panel {
        width: calc(100vw - 16px) !important;
        left: 8px !important;
        right: 8px !important;
        max-width: none;
    }
    .controls {
        gap: 8px;
    }
    .controls button {
        width: 36px;
        height: 36px;
    }
    .controls button:nth-child(3) {
        width: 44px;
        height: 44px;
    }
}
@media (max-width: 480px) {
    .music-player {
        max-width: 260px;
    }
    .song-title {
        font-size: 14px;
    }
    .song-artist {
        font-size: 12px;
    }
    .controls {
        gap: 6px;
        margin-bottom: 12px;
    }
    .controls button {
        width: 32px;
        height: 32px;
    }
    .controls button:nth-child(3) {
        width: 40px;
        height: 40px;
    }
    .playlist-item {
        padding: 8px 12px;
    }
    .playlist-item .w-10 {
        width: 32px;
        height: 32px;
    }
}
@keyframes slide-up {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
.animate-slide-up {
    animation: slide-up 0.3s ease-out;
}
@media (hover: none) and (pointer: coarse) {
    .music-player button,
    .playlist-item {
        min-height: 44px;
    }
    .progress-section > div,
    .bottom-controls > div:nth-child(2) {
        height: 12px;
    }
}
/* 让主题色按钮更有视觉反馈 */
button.bg-\[var\(--primary\)\] {
    box-shadow: 0 0 0 2px var(--primary);
    border: none;
}
</style>
{/if}