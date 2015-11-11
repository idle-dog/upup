module.exports = {
	//小人图片
	peopleImage : __inline('./img/people.png'),
	//牌子图片
	brandImage : __inline('./img/brand.png'),
	//手图片
	handImage : __inline('./img/hand.png'),
	//小人总数
	peopleTotal : 20,
	//牌子总数
	brandTotal : 12,
	//固定牌子的index, 如果不在0~brandTotal之间，则随机出牌子
	brandIndex : 9,
	//手总数
	handTotal : 1,
	//小人x偏移
	peopleOffsetX : 0,
	//小人y偏移
	peopleOffsetY : 42,
	//牌子x偏移
	brandOffsetX: 20,
	//牌子y偏移
	brandOffsetY : 0,
	//手x偏移
	handOffsetX : 67,
	//手y偏移
	handOffsetY : 56,
	//文字相对牌子x偏移
	textOffsetX : 43,
	//文字相对牌子y偏移
	textOffsetY : 30,
	//单个举牌子宽度
	singleItemWidth: 114,
	//单个举牌子高度
	singleItemHeight: 165,
	//第二个牌子位于第一个牌子后，向左的偏移
	singleItemOffsetX : -58,
	//第二个牌子相对第一个牌子后，向下的偏移
	singleItemOffsetY : 19,
	//文字样式
	textStyle : "30px SimHei",
	//文字颜色
	textColor : '#639DD3'
}
