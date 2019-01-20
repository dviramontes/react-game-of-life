import React from 'react'
import './Game.css'

const WIDTH = 800;
const HEIGHT = 600;
const CELL_SIZE = 20;

const Cell = ({ x, y }) => (
	<div className="Cell"
	     style={{
		     left: `${CELL_SIZE * x + 1}px`,
		     top: `${CELL_SIZE * y + 1}px`,
		     width: `${CELL_SIZE - 1}px`,
		     height: `${CELL_SIZE - 1}px`,
	     }}/>)

class Game extends React.Component {
	constructor() {
		super();
		this.rows = HEIGHT / CELL_SIZE;
		this.cols = WIDTH / CELL_SIZE;
		this.board = this.makeEmptyBoard();
	}

	state = {
		cells: [],
		interval: 100,
		isRunning: false,
	};

	runGame = () => {
		this.setState({isRunning: true});
		this.runIteration();
	}

	stopGame = () => {
		this.setState({isRunning: false});
		if (this.timeoutHandler) {
			window.clearInterval(this.timeoutHandler);
			this.timeoutHandler = null;
		}
	}

	tick = (e) => {
		this.setState({interval: e.target.value});
	}

	handleClearBoard = () => {
		this.board = this.makeEmptyBoard();
		this.setState({cells: this.makeCells()});
	}

	handleRandom = () => {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				this.board[y][x] = (Math.random() >= 0.5)
			}
		}
		this.setState({cells: this.makeCells()});
	}

	// create empty board
	makeEmptyBoard() {
		let board = [];
		for (let y = 0; y < this.rows; y++) {
			board[y] = [];
			for (let x = 0; x < this.cols; x++) {
				board[y][x] = false;
			}
		}
		return board;
	}

	// create cells from this.board
	makeCells() {
		let cells = [];
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				if (this.board[y][x]) {
					cells.push({x, y});
				}
			}
		}
		return cells;
	}

	getElementOffset() {
		const rect = this.boardRef.getBoundingClientRect();
		const doc = document.documentElement;

		return {
			x: (rect.left + window.pageXOffset) - doc.clientLeft,
			y: (rect.top + window.pageYOffset) - doc.clientTop,
		};
	}

	handleClick = (e) => {
		const elemOffset = this.getElementOffset();
		const offsetX = e.clientX - elemOffset.x;
		const offsetY = e.clientY - elemOffset.y;
		const x = Math.floor(offsetX / CELL_SIZE);
		const y = Math.floor(offsetY / CELL_SIZE);

		if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
			this.board[y][x] = !this.board[y][x]; // toggle
		}

		this.setState({cells: this.makeCells()});
	}

	render() {
		const {cells, isRunning} = this.state;
		return (
			<div>
				<div className="Board"
				     style={{
					     width: WIDTH,
					     height: HEIGHT,
					     backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
				     }}
				     ref={(n) => {
					     this.boardRef = n;
				     }}
				     onClick={this.handleClick}>
					{cells.map(cell => (
						<Cell
							x={cell.x}
							y={cell.y}
							key={`${cell.x},${cell.y}`}/>
					))}
				</div>
				<div className="controls">
					Update every
					<input value={this.state.interval}
					       onChange={this.tick}/> msec
					{isRunning ?
						<button className="button"
						        onClick={this.stopGame}
						>STOP</button>
						:
						<button className="button"
						        onClick={this.runGame}
						>RUN</button>
					}
					<button className="button"
					        onClick={this.handleClearBoard}
					>CLEAR
					</button>
					<button className="button"
					        onClick={this.handleRandom}
					>RANDOM
					</button>
				</div>
			</div>
		)
	}

	runIteration = () => {
		console.log("running iteration");
		let newBoard = this.makeEmptyBoard();

		// simplified rules for game of life
		// 0 => 3 live => 1
		// 1 => < 2 live || > 3 => 0
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				let neighbors = this.calculateNeighbors(this.board, x, y);
				if (this.board[y][x]) {
					if (neighbors === 2 || neighbors === 3) {
						newBoard[y][x] = true;
					} else {
						newBoard[y][x] = false;
					}
				} else { // 4 rule
					if (!this.board[y][x] && neighbors === 3) {
						newBoard[y][x] = true;
					}
				}
			}
		}

		this.board = newBoard;
		this.setState({cells: this.makeCells()});

		this.timeoutHandler = window.setTimeout(() => {
			this.runIteration()
		}, this.state.interval);

	}

	/**
	 * Calculate the number of neighbors at point (x, y)
	 * @param {Array} board
	 * @param {int} x
	 * @param {int} y
	 */
	calculateNeighbors(board, x, y) {
		let neighbors = 0;
		const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
		for (let i = 0; i < dirs.length; i++) {
			const dir = dirs[i];
			let y1 = y + dir[0];
			let x1 = x + dir[1];

			if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
				neighbors++;
			}
		}

		return neighbors;
	}
}

export default Game;