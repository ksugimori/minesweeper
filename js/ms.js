/**
 * class Tile
 */
function Tile(row, col) {
    this.row_ = row;
    this.col_ = col;
    this.value_ = 0;
    this.is_flipped_ = false;
    this.has_mine_ = false;
}

Tile.prototype = {
    constructor: Tile,
    
    flip: function() {
        this.is_flipped_= true;
    },
    
    putMine: function() {
        this.has_mine_ = true;
    },
};


/**
 * class Board
 */
function Board(size_col, size_row) {
    this.size_col_ = size_col;
    this.size_row_ = size_row;
    this.map_ = [];
    
    this.createMap();
    this.setNeighborList();
}

Board.prototype = {
    constructor: Board,
    
    createMap: function() {
        for (var i=0; i<this.size_row_; i++) {
            var row = [];
            for (var j=0; j<this.size_col_; j++) {
                row.push({tile: new Tile(i, j), neighbor_list: []});
            }
            this.map_.push(row);
        }
    },
    
    // 何やってるのかわかりづらい。。。
    setNeighborList: function() {
        for (var i=0; i<this.size_row_; i++) {
            for (var j=0; j<this.size_col_; j++) {
                for (var x=Math.max(j-1, 0); x<=Math.min(j+1, this.size_col_-1); x++) {
                    for (var y=Math.max(i-1, 0); y<=Math.min(i+1, this.size_row_-1); y++) {
                        if (!(x === j && y === i)) {
                            this.map_[i][j].neighbor_list.push(this.map_[y][x].tile);
                        }
                    }
                }
            }
        }
    },
    
    putMines: function(num_of_mines) {
        while (num_of_mines > 0) {
            var rand = Math.floor(100 * Math.random());
            var row = Math.floor(rand / this.size_col_);
            var col = Math.floor(rand % this.size_col_);
            
            var tile = this.map_[row][col].tile;
            if (!tile.has_mine_) {
                tile.putMine();
                num_of_mines--;
            }
        }
    },
    
    countUp: function() {
        for (var row=0; row<this.size_row_; row++) {
            for (var col=0; col<this.size_col_; col++) {
                var tile = this.map_[row][col].tile;
                var neighbor_list = this.map_[row][col].neighbor_list;
                
                if (tile.has_mine_) {
                    continue;
                }
                
                var cnt = 0;
                neighbor_list.forEach(function(neighbor) {
                    if (neighbor.has_mine_) {
                        cnt++;
                    }
                });
                tile.value_ = cnt;
            }
        }
    },
    
    open: function(col, row, ret) {
        var tile = this.map_[row][col].tile;
        var neighbor_list = this.map_[row][col].neighbor_list;
        if (tile.is_flipped_ || tile.has_mine_) {
            return ret;
        }
        tile.flip();
        
        var val = (tile.value_ === 0) ? '' : tile.value_;
        ret.push({row: row, col: col, val: val});
        
        if (val === '') {
            for (var i=0; i<neighbor_list.length; i++) {
                ret = this.open(neighbor_list[i].col_, neighbor_list[i].row_, ret);
            }
        }
        
        return ret;
    }
};


/**
 * class MineSweeper
 */
function MineSweeper($field, size_col, size_row, num_mines) {
    this.$field_ = $field;
    this.board_ = undefined;
    
    this.size_col_ = size_col;
    this.size_row_ = size_row;
    this.num_mines_ = num_mines;
}

MineSweeper.prototype = {
    constructor: MineSweeper,
    
    CLASSES: ['zero', 'one', 'two', 'three',
        'four', 'five', 'six', 'seven', 'eight'],
    
    init: function() {
        this.board_ = new Board(this.size_col_, this.size_row_);
        this.board_.putMines(this.num_mines_);
        this.board_.countUp();
        
        this.createBlankBoardHTML();
        this.setBoardHTMLClass();
    },
    
    start: function() {
        this.start_time_ = Date.now();
    },
    
    getTime: function() {
        //TODO 
    },
    
    countNokori: function() {
        var cnt = 0;
        this.board_.map_.forEach(function(rows) {
            rows.forEach(function(list) {
                if (list.tile.is_flipped_) {
                    cnt++;
                }
            });
        });
        
        var total = this.board_.size_row_ * this.board_.size_col_;
        return total - cnt;
    },
    
    createBlankBoardHTML: function() {
        this.$field_.children('*').remove();
        
        for (var i=0; i<this.board_.size_row_; i++) {
            this.$field_.append('<ul>');
        }
        
        for (var j=0; j<this.board_.size_col_; j++) {
            var tileHTML = '<li> <span> <figure></figure> ' + 
                '<figure></figure> </span> </li>';
            this.$field_.find('ul').append(tileHTML);
        }
        
        // set style
        this.$field_.find('ul').addClass('row');
        this.$field_.find('li').addClass('tile_container');
        this.$field_.find('span').addClass('tile');
        this.$field_.find('span figure:nth-child(1)').addClass('frontside');
        this.$field_.find('span figure:nth-child(2)').addClass('backside');
        this.$field_.find('span figure:nth-child(2)').addClass('back');
    },
    
    setBoardHTMLClass: function() {
        var $backside = $('#field_area ul li figure.backside');
        $backside.removeClass();
        $backside.addClass('backside');
        $backside.addClass('back');
        $backside.text('');
        
        var board = this.board_;
        for (var i=0; i<board.size_row_; i++) {
            for (var j=0; j<board.size_col_; j++) {
                var selector = '#field_area ' +
                    'ul:nth-child(' + (i+1) + ') ' +
                    'li:nth-child(' + (j+1) + ') ' +
		    'figure.backside';
                
                var $backface = $(selector);
                var tile = board.map_[i][j].tile;
                if (tile.has_mine_) {
		    $backface.addClass('mine');
		    
		    $backface.append("<div class='bomb_bump'></div>");
		    $backface.append("<div class='bomb_bump'></div>");
		    $backface.append("<div class='bomb_bump'></div>");
		    $backface.append("<div class='bomb_bump'></div>");
		    $backface.append("<div class='bomb_circle'></div>");
		    
		    $backface.children("div.bomb_bump:nth-child(1)").css("transform", "rotateZ(45deg)");
		    $backface.children("div.bomb_bump:nth-child(2)").css("transform", "rotateZ(90deg)");
		    $backface.children("div.bomb_bump:nth-child(3)").css("transform", "rotateZ(135deg)");
		    
                } else {
		    $backface.addClass(this.CLASSES[tile.value_]);
                }
	    }
        }
    },
    
    open: function(index) {
        var row = Math.floor(index / this.board_.size_col_);
        var col = index % this.board_.size_col_;
        
        console.log('(x, y) = (' + col + ', ' + row + ')');
        
        var tile = this.board_.map_[row][col].tile;
        if (tile.has_mine_) {
            $('.mine').parent('span.tile').addClass('flipped_tile');
//            alert('You Lose!');
            return;
        } else {
            var tileList = this.board_.open(col, row, []);
            
            for (var i=0; i<tileList.length; i++) {
                var idxR = tileList[i].row + 1;
                var idxC= tileList[i].col + 1;
                var val = tileList[i].val;
                
                var selector = 'ul:nth-child('+idxR+') li:nth-child('+idxC+') span';
                this.$field_.find(selector+' figure:nth-child(2)').text(val);
                this.$field_.find(selector).addClass('flipped_tile');
            }
        }
    }
};




/**
 * Common Functions
 */
var flip = function(event) {
    var game = event.data.game;
    
    game.open($('.tile').index(this));
    
    if (game.countNokori() === 10) {
        alert('You Win!¥nTime: ' + game.getTime());
    }
};

var reset = function(event) {
    event.data.game.init();
    $('.flipped_tile').removeClass('flipped_tile');
    $('.tile').bind('click', {game: event.data.game}, flip);
};

/**
 * initialize
 */
$(document).ready(function() {
    var size_row = 10;
    var size_col = 10;
    var num_mines = 10;
    var ms = new MineSweeper($('#field_area'), size_col, size_row, num_mines);

    ms.init();

    $('.tile').bind('click', {game: ms}, flip);
    $('#reset_button').bind('click', {game: ms}, reset);
});