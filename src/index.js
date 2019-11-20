import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//Input gamebaord
let size = 3;

class Size extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {

    size = this.state.value;
    //alert('Game Board submitted: ' + size);
    ReactDOM.render(
      <div>
        <div class = "status"> <Size/> </div>
        <div class = "status"> <Game/> </div>
      </div>, document.getElementById("root"));

    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Input gameboard size you want:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

function Square(props) {
  const className = 'square' + (props.highlight ? ' highlight' : '');
  return (
    <button
      className={className}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winLine && winLine.includes(i)}
      />
    );
  }

  render() {
    // Use two loops to make the squares
    const boardSize = size;
    let squares = [];
    for (let i = 0; i < boardSize; ++i) {
      let row = [];
      for (let j = 0; j < boardSize; ++j) {
        row.push(this.renderSquare(i * boardSize + j));
      }
      squares.push(<div key={i} className="board-row">{row}</div>);
    }

    return (
      <div>{squares}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          // Store the index of the latest moved square
          latestMoveSquare: i
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  handleSortToggle() {
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  render() {
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winInfo = calculateWinner(current.squares);
    const winner = winInfo.winner;

    let moves = history.map((step, move) => {
      const latestMoveSquare = step.latestMoveSquare;
      const col = 1 + latestMoveSquare % 3;
      const row = 1 + Math.floor(latestMoveSquare / 3);
      const desc = move ?
        `Go to move #${move} (${col}, ${row})` :
        'Go to game start';
      return (
        <li key={move}>
          {/* Bold the currently selected item */ }
          <button
            className={move === stepNumber ? 'currently-selected-item' : ''}
            onClick={() => this.jumpTo(move)}>{desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      if (winInfo.isDraw) {
        status = "No more move. No winner in this game.";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }

    const isAscending = this.state.isAscending;
    if (!isAscending) {
      moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winLine={winInfo.line}
          />
        </div>
        <div className="game-info">
          <div className={winInfo.isDraw === true ? 'status endGame' : 'status'}>{status}</div>
          <button onClick={() => this.handleSortToggle()}>
            {isAscending ? 'descending' : 'ascending'}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <div>
    <div class = "status"> <Size/> </div>
    <div class = "status"> <Game/> </div>
  </div>, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i],
        isDraw: false,
      };
    }
  }

  let isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  }
  return {
    winner: null,
    line: null,
    isDraw: isDraw,
  };
}
