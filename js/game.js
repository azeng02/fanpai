//js/game.js
$(function(){
    const imgArr=['Bat.png','Bones.png','Cauldron.png',
    'Dracula.png','Eye.png','Ghost.png','Pumpkin.png','Skull.png'];
    // let card = imgArr.map(p => `<div class="card">
    //     <div class="card-back card-face">
    //         <img class="cob-web cob-web-top-left" src="img/Cobweb.png">
    //         <img class="cob-web cob-web-top-right" src="img/Cobweb.png">
    //         <img class="cob-web cob-web-bottom-left" src="img/Cobweb.png">
    //         <img class="cob-web cob-web-bottom-right" src="img/Cobweb.png">
    //         <img class="spider" src="img/Spider.png">
    //     </div> 
    //     <div class="card-front card-face">
    //         <img class="cob-web cob-web-top-left" src="img/CobwebGrey.png">
    //         <img class="cob-web cob-web-top-right" src="img/CobwebGrey.png">
    //         <img class="cob-web cob-web-bottom-left" src="img/CobwebGrey.png">
    //         <img class="cob-web cob-web-bottom-right" src="img/CobwebGrey.png">
    //         <img class="card-value" src="img/${p}">
    //     </div>
    //     </div>`);
        // let hs = [...card,...card];
        let hs = imgArr.reduce((rs,p)=>{
            const temp = `<div class="card">
            <div class="card-back card-face">
                <img class="cob-web cob-web-top-left" src="img/Cobweb.png">
                <img class="cob-web cob-web-top-right" src="img/Cobweb.png">
                <img class="cob-web cob-web-bottom-left" src="img/Cobweb.png">
                <img class="cob-web cob-web-bottom-right" src="img/Cobweb.png">
                <img class="spider" src="img/Spider.png">
            </div> 
            <div class="card-front card-face">
                <img class="cob-web cob-web-top-left" src="img/CobwebGrey.png">
                <img class="cob-web cob-web-top-right" src="img/CobwebGrey.png">
                <img class="cob-web cob-web-bottom-left" src="img/CobwebGrey.png">
                <img class="cob-web cob-web-bottom-right" src="img/CobwebGrey.png">
                <img class="card-value" src="img/${p}">
            </div>
            </div>`;
            rs.push(temp);
            rs.push(temp);
            return rs;
        },[]);
        $('#gc').append(hs.join(''));

        //初始化游戏界面
        let cards = Array.from($('.card'));
        const game= new MixOrMatch(100,cards);
        $('.overlay-text').click(function(){
            $(this).removeClass('visible');
            game.startGame();    
        });
        $('.card').click(function(){
            //翻拍操作
            game.flipCard(this);
        });
 
});
//音效控制类
class AudipController{
    constructor(){
        //游戏背景音乐
        this.bgMusic = new Audio('sound/creepy.mp3');
        this.bgMusic.volume = 0.5;
        //设置背景音乐循环播放
        this.bgMusic.loop = true;
        //翻拍音效
        this.flipSound = new Audio('sound/flip.wav');
        //匹配成功的声音
        this.matchSound = new Audio('sound/match.wav');
        //游戏胜利的声音
        this.victorySound = new Audio('sound/victory.wav');
        //游戏失败
        this.gameOverSound = new Audio('sound/10.wav');
    }
    //游戏开始的时候
    startMusic(){
        // console.log('游戏开始');
        //播放背景音乐
        this.bgMusic.play();
        if(this.gameOverSound.paly){
        //暂停游戏失败的音乐
            this.gameOverSound.pause();
        //重置游戏失败的音乐
            this.gameOverSound.currentTime = 0;
        }
    }
    //游戏结束时播放的音乐的方法
    stopMusic(){
        //暂停游戏背景音乐
        this.bgMusic.pause();
        //充值游戏背景音乐
        this.bgMusic.currentTime = 0;
    }
    //翻拍时的音效
    flip(){
        this.flipSound.play();
    }
    //匹配音效
    match(){
        this.matchSound.play();
    }
    //游戏胜利时的音效
    victory(){
        //停止背景音乐
        this.stopMusic();
        //播放胜利的音乐
        this.victorySound.play();
    }
    //游戏失败的音乐
    gameOver(){
        //停止背景音乐
        this.stopMusic();
        this.gameOverSound.play();
    }
}
//游戏核心类（翻拍判定）
//1.打乱牌的顺序
// 2.判断是否匹配
class MixOrMatch{
    //totalTime倒计时的秒数，cards卡片数组
    constructor(totalTime,cards){
        //将时间倒计时和卡片数组添加到当前的对象中
        this.cardArray = cards;
        this.totalTime = totalTime;
        //保存倒计时剩余时间
        this.timeRemaining = totalTime;
        //获取页面中id为time-remaining的元素，并且保存到timer属性中国
        this.timer = $('#time-remaining');
        //计算已经匹配成功的牌的数量
        this.ticker = $('#flips');
        //创建一个音效控制对象
        this.audipController = new AudipController();
    }
    //开始游戏
    startGame(){
        this.totalClicks = 0;
        //恢复倒计时为默认事件
        this.timeRemaining = this.totalTime;
        //需要匹配的卡片
        this.cardToCheck = null;
        //已经匹配成功的卡片
        this.matchedCards = [];
        //用来控制同一时间只能翻两张牌的变量
        this.busy = true;
        setTimeout(() => {
            //播放背景音乐
            this.audipController.startMusic();
            //打乱卡片顺序
            this.shuffleCards(this.cardArray);
            //控制计时器
            this.countDown = this.startCountDown();
            this.busy = false;
        },500);
        //初始化游戏
        //将所有的卡片返回去
        //重置倒计时和点次数
        this.cardArray.forEach(card => {
            $(card).removeClass('visible').removeClass('matched');           
        });
        this.timer.html(this.timeRemaining);
        this.ticker.html(this.totalClicks);
    }
    //定义一个打乱卡片顺序的方法
    shuffleCards(cards){
        for(let i = cards.length-1;i>0;i--){
            //随机产生一个1-16之间的索引
            let ranfIndex =Math.floor(Math.random()*(i+1));
            //将随机产生的下标位置的元素跟当前索引的元素的位置做一个交换
            [cards[i],cards[ranfIndex]] = [cards[ranfIndex],cards[i]];
        }
        //设置每张卡片的标记，order属性,按照order大小顺次排列
        cards = cards.map((card,index) => {
            return $(card).css('order',index);
        });
    }
    //定义计时器
    startCountDown(){
        return setInterval(() => {
            this.timeRemaining --;
            //将时间刷新
            this.timer.html(this.timeRemaining);
            // 当this.timer为0,游戏结束
            if(this.timeRemaining ===0){
                //停止当前的interval
                clearInterval(this.countDown);
                //播放游戏失败的音乐
                this.audipController.gameOver();
                //弹出游戏失败的提示框
                $('#gameOverText').addClass('visible');
            }
        },1000);  
    }
    //翻牌逻辑
    // card就是点中的卡片
    flipCard(card){
        //判断是否能够翻开这张卡片
        if(this.canFlipCard(card)){
            //添加音效
            this.audipController.flip();
            //card添加visible样式类
            $(card).addClass('visible');
            //判断两张牌是否匹配
            if(this.cardToCheck){//判断是否翻开第一张牌
                //用当前的这张卡片跟this.cardToCheck比较
                //进行匹配的方法
                this.checkForCardMatch(card);
            }else{
                this.cardToCheck = card;
            }
        }
    }
    //判断牌是否能翻开的方法
    canFlipCard(card){
        return !this.busy && card !== this.cardToCheck && !this.matchedCards.includes(card);
    }
    //两张卡片是否匹配成功
    checkForCardMatch(card){
        //获取被匹配卡片的src属性
        let s1 = $(card).find('.card-value').attr('src');
        //获取前面一张卡片的src属性
        let s2 = $(this.cardToCheck).find('.card-value').attr('src');
        if(s1 === s2){
            this.cardMatch(card,this.cardToCheck);
        }else{
           this.cardMisMatch(card,this.cardToCheck);
        }
        //匹配结束后，将this.cardToCheck返回空
        this.cardToCheck=null;
    }
    //卡片匹配成功后
    cardMatch(c1,c2){
        //将匹配成功的卡片都放到this.matchedCards数组中
        this.matchedCards.push(c1);
        this.matchedCards.push(c2);
        //添加match样式
        $(c1).addClass('matched');
        $(c2).addClass('matched');
        this.audipController.match();
        //判断所有卡牌匹配完成
        if(ChannelSplitterNode.length === this.matchedCards.length){
            //游戏胜利
            this.audipController.victory();
            //停止计时
            clearInterval(this.countDown);
            //弹出游戏胜利的提示框
            $('#victory-text').addClass('visible');
        }
    }
    //失败
    cardMisMatch(c1,c2){
        this.busy = true;
        //一秒钟以后将两张牌翻回去
        setTimeout(() => {
            $(c1).removeClass('visible');
            $(c2).removeClass('visible');
            this.busy = false;
        },1000);
    }
    
}
