import React, {useEffect} from 'react';
import { useCallback } from 'react';
import './App.css';

type colorCount = {
    hexValue: string, // stores the hex value of the color
    count: number
};

type ColorPickerProps = {
    colors: colorCount[],
    onChange: (updatedColors: colorCount[]) => void
};

function getAdjacentColors(floor: string[][], x: number, y:number): string[] {
    let adjacentColors: string[] = [];
    console.log('floor', [...floor], y, x)
   //if (!floor[y] || !floor[y][x]) return adjacentColors;

    // Check the left and above tiles
    if (y>0 && x>0 && floor[y-1].length > 0 && floor[y-1] && floor[y-1][x-1]) {
        adjacentColors.push(floor[y-1][x - 1]);
    }
    if (y > 0 && floor[y-1] && floor[y - 1][x]) {
        adjacentColors.push(floor[y - 1][x]);
    }
    //Check above right tile
    if (y > 0 && floor[y-1] && floor[y - 1][x+1]) {
        adjacentColors.push(floor[y - 1][x+1]);
    }

    // Check the right and below tiles
    if (floor[y] && x < floor[y].length - 1 && floor[y] && floor[y][x+1]) {
        adjacentColors.push(floor[y][x + 1]);
    }
    if (y < floor.length - 1 && floor[y+1] && floor[y + 1][x]) {
        adjacentColors.push(floor[y + 1][x]);
    }


    console.log('adjacentColors', adjacentColors);
    return adjacentColors;
}
/*
function adjacentCount(floor: string[][], x: number, y: number, color: string) {
    let count = 0;

    // For even rows
    if (y % 2 === 0) {
        if (x > 0) {
            // Left
            if (floor[y][x - 1] === color) count++;
            // Top-left
            if (y > 0 && floor[y - 1][x - 1] === color) count++;
            // Bottom-left
            if (y < floor.length - 1 && floor[y + 1][x - 1] === color) count++;
        }
        // Right
        if (x < floor[y].length - 1 && floor[y][x + 1] === color) count++;
        // Top-right
        if (x < floor[y].length - 1 && y > 0 && floor[y - 1][x] === color) count++;
        // Bottom-right
        if (x < floor[y].length - 1 && y < floor.length - 1 && floor[y + 1][x] === color) count++;
    }
    // For odd rows
    else {
        // Left
        if (x > 0 && floor[y][x - 1] === color) count++;
        // Top
        if (y > 0 && floor[y - 1][x] === color) count++;
        // Bottom
        if (y < floor.length - 1 && floor[y + 1][x] === color) count++;
        // Right
        if (x < floor[y].length - 1 && floor[y][x + 1] === color) count++;
        // Bottom-left
        if (x > 0 && y < floor.length - 1 && floor[y + 1][x - 1] === color) count++;
        // Bottom-right
        if (x < floor[y].length - 1 && y < floor.length - 1 && floor[y + 1][x] === color) count++;
    }

    console.log('count', count);
    return count;
}
*/
function ColorPicker({ colors, onChange }: ColorPickerProps) {
    return (
        <div>
            {colors.map((colorInfo, idx) => (
                <div key={idx}>
                    <label>{idx}</label>
                    <input
                        type="color"
                        value={colorInfo.hexValue}
                        onChange={e => {
                            let newColors = [...colors];
                            newColors[idx].hexValue = e.target.value;
                            onChange(newColors);
                        }}
                    />
                    <input
                        type="number"
                        value={colorInfo.count}
                        onChange={e => {
                            let newColors = [...colors];
                            newColors[idx].count = +e.target.value;
                            onChange(newColors);
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

function App() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [floorLength, setFloorLength] = React.useState(13);
    const [floorWidth, setFloorWidth] = React.useState(15);
    const [maxAdjacentAllowed, setMaxAdjacentAllowed] = React.useState(0);

    const initialColors: colorCount[] = [
        {hexValue: '#6ebfff', count: 35},
        {hexValue: '#FFFFFF',count:17},
        {hexValue: '#0000FF',count:24},
        {hexValue: '#FFFF00',count:38},
        {hexValue: '#00FF11',count:23},
        {hexValue: '#FF00FF',count:24},
        {hexValue: '#994000',count:21},
        {hexValue: '#000000',count:27},
    ];
    /*
    function generateColorTable(length: number): colorCount[]  {
        let colorTable = [];
        for(let i = 0; i < length; i++) {
            colorTable.push({hexValue: initialColors[i % length], count: Math.floor(floorLength * floorWidth / length )});
        }
        return colorTable;
    }

     */
    //const colorsCountInitial = generateColorTable(initialColors.length)
    const colorsCountInitial = initialColors;

    useEffect(() => {
        document.title = 'Random tile color';
    }, []);
    const [floor, setFloor] = React.useState<string[][]>([]);
    const [colorsCount, setColorsCount] = React.useState<colorCount[]>(colorsCountInitial);
    const generateFloor = useCallback(() => {
        let availableColors: string[] = [];
        colorsCount.forEach(colorInfo => {
            for(let i = 0; i < colorInfo.count; i++) {
                availableColors.push(colorInfo.hexValue);
            }
        });

        let newFloor = [];
        for(let y = 0; y < floorLength; y++) {
            let row = [];
            // Reduce tiles in odd rows by 1 for honeycomb effect
            const tilesInRow = y % 2 === 0 ? floorWidth : floorWidth - 1;
            for(let x = 0; x < tilesInRow; x++) {
                const colorToTheLeft: string = x > 0 ? row[x - 1] : '';
                const adjacentColors = getAdjacentColors(newFloor, x, y) ;
                //add colortotheleft to adjacentcolors if it is not ''
                if (colorToTheLeft !== '') {
                    adjacentColors.push(colorToTheLeft);
                }

                let availableColorsForTile: string[] = availableColors//availableColors.filter(color => !adjacentColors.includes(color) && color !== colorToTheLeft);
                console.log('adjacentColors', getAdjacentColors(newFloor, x, y), colorToTheLeft);
                //make an array where adjacent unique colors are counted and if the count is greater than maxAdjacentAllowed, remove that color from the available colors
                const adjacentColorsCount = adjacentColors.reduce((acc: { [key: string]: number }, color: string) => {
                    acc[color] = (acc[color] || 0) + 1;
                    return acc;
                }, {});
                const colorsToRemove: string[] = [];
                Object.keys(adjacentColorsCount).forEach(color => {
                    if (adjacentColorsCount[color] > maxAdjacentAllowed) {
                        colorsToRemove.push(color);
                    }
                });

                availableColorsForTile = availableColors.filter(color => !colorsToRemove.includes(color));


                console.log('adjacentColorsCount', adjacentColorsCount);
                console.log('availableColors', availableColors  );
                console.log('availableColorsForTile', availableColorsForTile);

                const randomIndex = Math.floor(Math.random() * availableColorsForTile.length);
                console.log('randomIndex', randomIndex);
                row.push(availableColorsForTile[randomIndex]);
                //remove 1 used color from available colors
                const usedColorIndex = availableColors.indexOf(availableColorsForTile[randomIndex]);
                availableColors.splice(usedColorIndex, 1);
            }
            newFloor.push(row);
        }
        setFloor(newFloor);
    }, [colorsCount, floorLength, maxAdjacentAllowed])

    const drawTiles = React.useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const hexSize = 50;
        //const hexHeight = 2 * hexSize;
        const hexWidth = Math.sqrt(3) * hexSize;
        const vertDist = hexSize * 1.5;
        const horizDist = hexWidth;


        floor.forEach((row, rowIndex) => {
            row.forEach((tileColor, colIndex) => {
                const xOffset = (rowIndex % 2) === 0 ? 0 : hexWidth/2;
                const x = colIndex * horizDist + xOffset;
                const y = rowIndex * vertDist;

                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    ctx.lineTo(
                        x + hexSize * Math.cos((i * 60 + 30) * Math.PI / 180),
                        y + hexSize * Math.sin((i * 60 + 30) * Math.PI / 180)
                    );
                }
                ctx.closePath();
                ctx.fillStyle =  tileColor;
                ctx.fill();
            });
        });
    }, [floor]);

    React.useEffect(() => {
        generateFloor();
    }, [floorLength, floorWidth, colorsCount, generateFloor]);
    React.useEffect(() => {
        drawTiles();
    }, [floor, drawTiles]);

    return (
        <div className="App">
            <div className="sidebar">
                <div>
                    <input placeholder="Floor Length" type="number" value={floorLength} onChange={e => setFloorLength(+e.target.value)} />
                    <input placeholder="Floor Width" type="number" value={floorWidth} onChange={e => setFloorWidth(+e.target.value)} />
                    <input
                        type="number"
                        value={maxAdjacentAllowed}
                        onChange={e => setMaxAdjacentAllowed(+e.target.value)}
                        placeholder="Max Adjacent Tiles"
                    />

                </div>
                <ColorPicker colors={colorsCount} onChange={setColorsCount} />
                <button onClick={generateFloor}>Generate Floor</button>
            </div>
            <canvas ref={canvasRef} width={floorLength * 100} height={floorWidth * 100}></canvas>
        </div>
    );

}

export default App;
