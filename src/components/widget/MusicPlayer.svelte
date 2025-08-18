<script lang="ts">
import Icon from "@iconify/svelte";
import { onDestroy, onMount } from "svelte";
import { slide } from "svelte/transition";
import { musicPlayerConfig } from "../../config";
import Key from "../../i18n/i18nKey";
import { i18n } from "../../i18n/translation";

// 播放器状态
let isPlaying = false;
let isExpanded = false;
let isHidden = false;
let showPlaylist = false;
let currentTime = 0;
let duration = 0;
let volume = 0.7;
let isMuted = false;
let isLoading = false;
let isShuffled = false;
let isRepeating = 2; // 0: 不循环, 1: 单曲循环, 2: 列表循环
let errorMessage = "";
let showError = false;

// 当前歌曲信息
let currentSong = {
	title: "難聴系男子が倒せない",
	artist: "ラマーズP/鏡音リン",
	cover: "https://cdn-2.chenhen.top/音乐/難聴系男子が倒せない.webp",
	url: "https://cdn-2.chenhen.top/音乐/難聴系男子が倒せない.opus",
};

// 播放列表
let playlist = [
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
		cover: "https://cdn-2.chenhen.top/音乐/踊っチャイナ (feat. 初音ミク & 重音テト).webp",
		url: "https://cdn-2.chenhen.top/音乐/踊っチャイナ (feat. 初音ミク & 重音テト).opus",
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
		artist: "《蔚蓝档案》最终章",
		cover: "https://cdn-2.chenhen.top/音乐/温柔的回忆.webp",
		url: "https://cdn-2.chenhen.top/音乐/温柔的回忆.opus",
		duration: 220,
	},
	{
		id: 8,
		title: "武装乙女",
		artist: "星尘infinity cover",
		cover: "https://cdn-2.chenhen.top/音乐/武装乙女（武装少女）【星尘infinity cover】.webp",
		url: "https://cdn-2.chenhen.top/音乐/武装乙女（武装少女）【星尘infinity cover】.opus",
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
		artist: "Yunomi/鬼頭明里",
		cover: "https://cdn-2.chenhen.top/音乐/恋のうた.webp",
		url: "https://cdn-2.chenhen.top/音乐/恋のうた.opus",
		duration: 209,
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
		artist: "《PA饭》ED",
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
		artist: "《总之就是非常可爱 第二季》",
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
		cover: "https://cdn-2.chenhen.top/音乐/克隆克隆（中文填词）.webp",
		url: "https://cdn-2.chenhen.top/音乐/克隆克隆（中文填词）.opus",
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
		cover: "https://cdn-2.chenhen.top/音乐/レインコート (feat. 雨衣).webp",
		url: "https://cdn-2.chenhen.top/音乐/レインコート (feat. 雨衣).opus",
		duration: 239,
	},
	{
		id: 27,
		title: "「リテラチュア」魔女之旅op",
		artist: "《魔女之旅》OP",
		cover: "https://cdn-2.chenhen.top/音乐/「リテラチュア」魔女之旅op（翻自 上田麗奈）.webp",
		url: "https://cdn-2.chenhen.top/音乐/「リテラチュア」魔女之旅op（翻自 上田麗奈）.opus",
		duration: 90,
	},
	{
		id: 28,
		title: "ライアーメイデン",
		artist: "ヤバス/りぃふ",
		cover: "https://cdn-2.chenhen.top/音乐/ライアーメイデン (feat. りぃふ).webp",
		url: "https://cdn-2.chenhen.top/音乐/ライアーメイデン (feat. りぃふ).opus",
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
		artist: "《我怎恋人 不行不行》OP",
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
		title: "《我推的孩子》OP",
		artist: "YOASOBI",
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
		artist: "《游戏中心的少女异文化交流》OP",
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
		artist: "《PA饭》OP",
		cover: "https://cdn-2.chenhen.top/音乐/そんなもんね.webp",
		url: "https://cdn-2.chenhen.top/音乐/そんなもんね.opus",
		duration: 180,
	},
	{
		id: 58,
		title: "お返事まだカナ？おじさん構文！",
		artist: "吉本おじさん/时雨羽衣",
		cover: "https://cdn-2.chenhen.top/音乐/お返事まだカナ？おじさん構文！ (feat. 雨衣).webp",
		url: "https://cdn-2.chenhen.top/音乐/お返事まだカナ？おじさん構文！ (feat. 雨衣).opus",
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
		artist: "CS 2音乐盒",
		cover: "https://cdn-2.chenhen.top/音乐/Under Bright Lights (feat. Indy Skies).webp",
		url: "https://cdn-2.chenhen.top/音乐/Under Bright Lights (feat. Indy Skies).opus",
		duration: 228,
	},
	{
		id: 62,
		title: "T氏の話を信じるな",
		artist: "ピノキオピー/初音ミク/重音テト",
		cover: "https://cdn-2.chenhen.top/音乐/T氏の話を信じるな (feat. 初音ミク & 重音テト).webp",
		url: "https://cdn-2.chenhen.top/音乐/T氏の話を信じるな (feat. 初音ミク & 重音テト).opus",
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
		cover: "https://cdn-2.chenhen.top/音乐/Please, Take On Me (A New World) [Kosmolab Re -Mashup].webp",
		url: "https://cdn-2.chenhen.top/音乐/Please, Take On Me (A New World) [Kosmolab Re -Mashup].opus",
		duration: 270,
	},
	{
		id: 65,
		title: "Nobody",
		artist: "《怪兽8号》ED",
		cover: "https://cdn-2.chenhen.top/音乐/Nobody (from Kaiju No. 8).webp",
		url: "https://cdn-2.chenhen.top/音乐/Nobody (from Kaiju No. 8).opus",
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
		cover: "https://cdn-2.chenhen.top/音乐/Lockdown (Tatsunoshin VIP).webp",
		url: "https://cdn-2.chenhen.top/音乐/Lockdown (Tatsunoshin VIP).opus",
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
	{
		id: 75,
		title: "1番輝く星",
		artist: "《艾莉同学》OP",
		cover: "https://cdn-2.chenhen.top/音乐/不时轻声地以俄语遮羞的邻座艾莉同学.webp",
		url: "https://cdn-2.chenhen.top/音乐/不时轻声地以俄语遮羞的邻座艾莉同学.opus",
		duration: 245,
	},
];

let currentIndex = 0;
let audio: HTMLAudioElement;
let progressBar: HTMLElement;
let volumeBar: HTMLElement;

// 切换播放/暂停
function togglePlay() {
	if (!audio || !currentSong.url) return;

	if (isPlaying) {
		audio.pause();
	} else {
		audio.play();
	}
}

// 切换展开/收缩状态
function toggleExpanded() {
	isExpanded = !isExpanded;
	if (isExpanded) {
		showPlaylist = false; // 展开播放器时关闭播放列表
		isHidden = false; // 展开时取消隐藏
	}
}

// 切换隐藏状态
function toggleHidden() {
	isHidden = !isHidden;
	if (isHidden) {
		isExpanded = false; // 隐藏时收缩播放器
		showPlaylist = false; // 隐藏时关闭播放列表
	}
}

// 切换播放列表显示
function togglePlaylist() {
	showPlaylist = !showPlaylist;
}

// 切换随机播放
function toggleShuffle() {
	isShuffled = !isShuffled;
}

// 切换循环模式
function toggleRepeat() {
	isRepeating = (isRepeating + 1) % 3; // 0: 不循环, 1: 单曲循环, 2: 列表循环
}

// 上一首
function previousSong() {
	const newIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
	console.log(`上一首歌曲: ${currentIndex} -> ${newIndex}`);
	playSong(newIndex);
}

// 下一首
function nextSong() {
	let newIndex: number;
	if (isShuffled) {
		// 随机播放
		do {
			newIndex = Math.floor(Math.random() * playlist.length);
		} while (newIndex === currentIndex && playlist.length > 1);
	} else {
		newIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
	}

	console.log(`下一首歌曲: ${currentIndex} -> ${newIndex}`);
	playSong(newIndex);
}

// 播放指定歌曲
function playSong(index: number) {
	if (index < 0 || index >= playlist.length) {
		console.error("无效的歌曲索引:", index);
		return;
	}

	const wasPlaying = isPlaying;
	const previousIndex = currentIndex;
	currentIndex = index;

	console.log(`切换歌曲: ${previousIndex} -> ${currentIndex}`, {
		wasPlaying,
		song: playlist[currentIndex],
	});

	// 停止当前播放
	if (audio) {
		audio.pause();
	}

	// 加载新歌曲
	loadSong(playlist[currentIndex]);

	// 如果之前在播放或者点击的是新歌曲，都应该开始播放
	if (wasPlaying || !isPlaying) {
		// 等待音频加载完成后播放
		const attemptPlay = () => {
			if (!audio) {
				console.error("音频对象不存在，无法播放");
				return;
			}

			if (audio.readyState >= 2) {
				console.log("音频已准备就绪，开始播放");
				audio.play().catch((error) => {
					console.error("播放失败:", error);
					// 如果播放失败，尝试重新加载
					setTimeout(() => {
						if (audio && audio.src) {
							audio.load();
						}
					}, 500);
				});
			} else {
				console.log("等待音频加载完成...");
				audio.addEventListener(
					"canplay",
					() => {
						console.log("音频可以播放，开始播放");
						audio.play().catch((error) => {
							console.error("延迟播放失败:", error);
						});
					},
					{ once: true },
				);
			}
		};

		// 稍微延迟执行，确保loadSong完成
		setTimeout(attemptPlay, 100);
	}
}

// 获取正确的资源路径
function getAssetPath(path: string): string {
	// 如果是外部链接，直接返回
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	// 如果已经是绝对路径，直接返回
	if (path.startsWith("/")) {
		return path;
	}

	// 对于相对路径，强制从根路径开始
	// 确保路径始终以 / 开头，避免相对路径问题
	return `/${path}`;
}

// 加载歌曲
function loadSong(song: typeof currentSong) {
	if (!song || !audio) {
		console.error("无法加载歌曲：歌曲信息或音频对象不存在", { song, audio });
		return;
	}

	currentSong = { ...song }; // 创建副本避免引用问题

	if (song.url) {
		try {
			// 设置加载状态
			isLoading = true;

			// 重置音频状态
			audio.pause();
			audio.currentTime = 0;
			currentTime = 0;
			duration = 0;

			// 清除之前的事件监听器（避免重复绑定）
			audio.removeEventListener("loadeddata", handleLoadSuccess);
			audio.removeEventListener("error", handleLoadError);
			audio.removeEventListener("loadstart", handleLoadStart);

			// 添加一次性事件监听器
			audio.addEventListener("loadeddata", handleLoadSuccess, { once: true });
			audio.addEventListener("error", handleLoadError, { once: true });
			audio.addEventListener("loadstart", handleLoadStart, { once: true });

			// 设置新的音频源，使用正确的路径
			audio.src = getAssetPath(song.url);
			audio.load();

			console.log(`开始加载歌曲: ${song.title} - ${song.artist}`, {
				url: song.url,
			});
		} catch (error) {
			console.error("加载歌曲时发生错误:", error);
			isLoading = false;
		}
	} else {
		console.warn("歌曲没有有效的URL", song);
		isLoading = false;
	}
}

// 音频加载成功处理
function handleLoadSuccess() {
	isLoading = false;
	duration = audio?.duration || 0;
	console.log(`歌曲加载成功: ${currentSong.title}`, { duration });
}

// 音频加载错误处理
function handleLoadError(event: Event) {
	isLoading = false;
	const errorDetails = {
		url: currentSong.url,
		error: event,
		audioError: audio?.error,
	};

	console.error(`歌曲加载失败: ${currentSong.title}`, errorDetails);

	// 显示用户友好的错误信息
	showErrorMessage(`无法播放 "${currentSong.title}"，正在尝试下一首...`);

	// 尝试加载下一首歌曲
	if (playlist.length > 1) {
		console.log("尝试加载下一首歌曲...");
		setTimeout(() => nextSong(), 1000);
	} else {
		showErrorMessage("播放列表中没有可用的歌曲");
	}
}

// 音频开始加载处理
function handleLoadStart() {
	console.log(`开始加载音频数据: ${currentSong.title}`);
}

// 显示错误信息
function showErrorMessage(message: string) {
	errorMessage = message;
	showError = true;
	console.error(message);

	// 3秒后自动隐藏错误信息
	setTimeout(() => {
		showError = false;
	}, 3000);
}

// 隐藏错误信息
function hideError() {
	showError = false;
}

// 设置进度
function setProgress(event: MouseEvent) {
	if (!audio || !progressBar) return;

	const rect = progressBar.getBoundingClientRect();
	const percent = (event.clientX - rect.left) / rect.width;
	const newTime = percent * duration;

	audio.currentTime = newTime;
	currentTime = newTime;
}

// 设置音量
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

// 切换静音
function toggleMute() {
	if (!audio) return;

	isMuted = !isMuted;
	audio.muted = isMuted;
}

// 格式化时间
function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// 音频事件处理
function handleAudioEvents() {
	if (!audio) return;

	// 基础播放状态事件
	audio.addEventListener("play", () => {
		isPlaying = true;
		console.log("音频开始播放");
	});

	audio.addEventListener("pause", () => {
		isPlaying = false;
		console.log("音频暂停");
	});

	audio.addEventListener("timeupdate", () => {
		currentTime = audio.currentTime;
	});

	// 播放结束事件
	audio.addEventListener("ended", () => {
		console.log("歌曲播放结束", {
			isRepeating,
			currentIndex,
			playlistLength: playlist.length,
			isShuffled,
		});

		if (isRepeating === 1) {
			// 单曲循环
			console.log("单曲循环，重新播放");
			audio.currentTime = 0;
			audio.play().catch((error) => {
				console.error("单曲循环播放失败:", error);
			});
		} else if (
			isRepeating === 2 ||
			currentIndex < playlist.length - 1 ||
			isShuffled
		) {
			// 列表循环或还有下一首或随机播放
			console.log("自动播放下一首");
			nextSong();
		} else {
			// 播放结束
			console.log("播放列表结束");
			isPlaying = false;
		}
	});

	// 通用错误处理
	audio.addEventListener("error", (event) => {
		isLoading = false;
		console.error("音频播放错误:", {
			error: audio.error,
			event,
			currentSong: currentSong.title,
		});
	});

	// 网络状态事件
	audio.addEventListener("stalled", () => {
		console.warn("音频加载停滞");
	});

	audio.addEventListener("waiting", () => {
		console.log("等待更多数据...");
	});
}

// 测试音频URL连接性
async function testAudioUrl(url: string): Promise<boolean> {
	try {
		// 使用getAssetPath处理URL路径
		const fullUrl = getAssetPath(url);
		const response = await fetch(fullUrl, { method: "HEAD" });
		return response.ok;
	} catch (error) {
		console.error(`音频URL测试失败: ${url}`, error);
		return false;
	}
}

// 验证播放列表中的音频URL
async function validatePlaylist() {
	console.log("开始验证播放列表音频URL...");
	for (let i = 0; i < playlist.length; i++) {
		const song = playlist[i];
		if (song.url) {
			const isValid = await testAudioUrl(song.url);
			console.log(
				`音频URL验证结果: ${song.title} - ${isValid ? "有效" : "无效"}`,
			);
		}
	}
}

onMount(() => {
	audio = new Audio();
	audio.volume = volume;
	handleAudioEvents();

	// 验证播放列表（可选，用于调试）
	// 暂时禁用验证功能，避免开发环境中的网络错误
	// if (import.meta.env.DEV) {
	// 	validatePlaylist();
	// }

	// 加载第一首歌曲
	if (playlist.length > 0) {
		console.log("初始化播放器，加载第一首歌曲");
		loadSong(playlist[0]);
	}
});

onDestroy(() => {
	if (audio) {
		audio.pause();
		audio.src = "";
	}
});
</script>

<!-- 音乐播放器 - 仅在配置启用时显示 -->
{#if musicPlayerConfig.enable}
<!-- 错误提示 -->
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

<!-- 音乐播放器主容器 -->
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
        
        <!-- 播放状态指示 -->
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
    
    <!-- 收缩状态的迷你播放器 -->
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
            <!-- 封面（带旋转动画） -->
            <div class="cover-container relative w-12 h-12 rounded-xl overflow-hidden">
                <img src={getAssetPath(currentSong.cover)} alt="封面" 
                     class="w-full h-full object-cover transition-transform duration-300"
                     class:animate-spin={isPlaying && !isLoading}
                     class:animate-pulse={isLoading} />
                
                <!-- 播放状态指示器 -->
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
            
            <!-- 歌曲信息 -->
            <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-90 truncate">{currentSong.title}</div>
                <div class="text-xs text-50 truncate">{currentSong.artist}</div>
            </div>
            
            <!-- 控制按钮组 -->
            <div class="flex items-center gap-1">
                <!-- 隐藏按钮 -->
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center" 
                        on:click|stopPropagation={toggleHidden}
                        title="隐藏播放器">
                    <Icon icon="material-symbols:visibility-off" class="text-lg" />
                </button>
                
                <!-- 展开按钮 -->
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center" 
                        on:click|stopPropagation={toggleExpanded}>
                    <Icon icon="material-symbols:expand-less" class="text-lg" />
                </button>
            </div>
        </div>
    </div>
    
    <!-- 展开状态的完整播放器 -->
    <div class="expanded-player card-base bg-[var(--float-panel-bg)] shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out"
         class:opacity-0={!isExpanded}
         class:scale-95={!isExpanded}
         class:pointer-events-none={!isExpanded}>
        
        <!-- 头部：封面和歌曲信息 -->
        <div class="flex items-center gap-4 mb-4">
            <!-- 大封面 -->
            <div class="cover-container relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={getAssetPath(currentSong.cover)} alt="封面" 
                     class="w-full h-full object-cover transition-transform duration-300"
                     class:animate-spin={isPlaying && !isLoading}
                     class:animate-pulse={isLoading} />
            </div>
            
            <!-- 歌曲详细信息 -->
            <div class="flex-1 min-w-0">
                <div class="song-title text-lg font-bold text-90 truncate mb-1">{currentSong.title}</div>
                <div class="song-artist text-sm text-50 truncate">{currentSong.artist}</div>
                <div class="text-xs text-30 mt-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
            
            <!-- 控制按钮组 -->
            <div class="flex items-center gap-1">
                <!-- 隐藏按钮 -->
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center" 
                        on:click={toggleHidden}
                        title="隐藏播放器">
                    <Icon icon="material-symbols:visibility-off" class="text-lg" />
                </button>
                
                <!-- 收缩按钮 -->
                <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center" 
                        on:click={toggleExpanded}>
                    <Icon icon="material-symbols:expand-more" class="text-lg" />
                </button>
            </div>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-section mb-4">
            <div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer"
                 bind:this={progressBar}
                 on:click={setProgress}
                 on:keydown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         const rect = progressBar.getBoundingClientRect();
                         const percent = 0.5; // 默认跳转到中间位置
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
                 aria-valuenow={currentTime / duration * 100}>
                <div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"
                     style="width: {duration > 0 ? (currentTime / duration) * 100 : 0}%"></div>
            </div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="controls flex items-center justify-center gap-2 mb-4">
            <!-- 随机播放 -->
            <button class="btn-plain w-10 h-10 rounded-lg" 
                    class:text-[var(--primary)]={isShuffled}
                    on:click={toggleShuffle}>
                <Icon icon="material-symbols:shuffle" class="text-lg" />
            </button>
            
            <button class="btn-plain w-10 h-10 rounded-lg" on:click={previousSong}>
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
            
            <button class="btn-plain w-10 h-10 rounded-lg" on:click={nextSong}>
                <Icon icon="material-symbols:skip-next" class="text-xl" />
            </button>
            
            <!-- 循环模式 -->
            <button class="btn-plain w-10 h-10 rounded-lg" 
                    class:text-[var(--primary)]={isRepeating > 0}
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
        
        <!-- 音量控制和播放列表 -->
        <div class="bottom-controls flex items-center gap-2">
            <!-- 音量控制 -->
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
                         // 键盘操作时调整音量
                         if (e.key === 'Enter') {
                             toggleMute();
                         }
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
            
            <!-- 播放列表按钮 -->
            <button class="btn-plain w-8 h-8 rounded-lg" 
                    class:text-[var(--primary)]={showPlaylist}
                    on:click={togglePlaylist}>
                <Icon icon="material-symbols:queue-music" class="text-lg" />
            </button>
        </div>
    </div>
    
    <!-- 播放列表面板 -->
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
                        
                        <!-- 播放状态指示器 -->
                        <div class="w-6 h-6 flex items-center justify-center">
                            {#if index === currentIndex && isPlaying}
                                 <Icon icon="material-symbols:graphic-eq" class="text-[var(--primary)] animate-pulse" />
                             {:else if index === currentIndex}
                                <Icon icon="material-symbols:pause" class="text-[var(--primary)]" />
                            {:else}
                                <span class="text-sm text-[var(--content-meta)]">{index + 1}</span>
                            {/if}
                        </div>
                        
                        <!-- 歌曲封面 -->
                        <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0">
                            <img src={getAssetPath(song.cover)} alt={song.title} class="w-full h-full object-cover" />
                        </div>
                        
                        <!-- 歌曲信息 -->
                        <div class="flex-1 min-w-0">
                            <div class="font-medium truncate" class:text-[var(--primary)]={index === currentIndex} class:text-90={index !== currentIndex}>
                                {song.title}
                            </div>
                            <div class="text-sm text-[var(--content-meta)] truncate" class:text-[var(--primary)]={index === currentIndex}>
                                {song.artist}
                            </div>
                        </div>
                        
                        <!-- 歌曲时长 -->
                        <div class="text-sm text-[var(--content-meta)] flex-shrink-0">
                            {formatTime(song.duration)}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
/* 小圆球播放器样式 */
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

/* 播放状态的音波动画 */
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

/* 隐藏模式下的容器调整 */
.music-player.hidden-mode {
	width: 48px;
	height: 48px;
}

/* 过渡动画优化 */
.orb-player {
	transform-origin: center;
	position: absolute;
	bottom: 0;
	left: 0;
}

.mini-player {
	transform-origin: bottom left;
}

.expanded-player {
	transform-origin: bottom left;
}

/* 确保播放器始终固定在左下角 */
.music-player {
	position: fixed !important;
	bottom: 1rem !important;
	left: 1rem !important;
}

/* 确保动画期间元素不会闪烁 */
.opacity-0 {
	visibility: hidden;
}

.pointer-events-none {
	pointer-events: none;
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

/* 进度条和音量条的交互效果 */
.progress-section div:hover,
.bottom-controls > div:hover {
    transform: scaleY(1.2);
    transition: transform 0.2s ease;
}

/* 响应式设计 */
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

/* 错误提示动画 */
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

/* 触摸设备优化 */
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
</style>
{/if}