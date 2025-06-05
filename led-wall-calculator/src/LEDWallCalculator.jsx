import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

export default function LEDWallCalculator() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [squares, setSquares] = useState([]);
  const containerRef = useRef(null);

  const MM_TO_PX = 3.78; // approx value to convert mm to px
  const PX_TO_INCH = 0.0393701;

  const addSquare = () => {
    if (width > 0 && height > 0) {
      const snappedWidth = Math.round(width / 10) * 10;
      const snappedHeight = Math.round(height / 10) * 10;
      setSquares([...squares, { width: snappedWidth, height: snappedHeight }]);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;
    squares.forEach((square, index) => {
      doc.text(
        `Square ${index + 1}: ${square.width}mm x ${square.height}mm`,
        10,
        yOffset
      );
      yOffset += 10;
    });
    const totalArea = calculateTotalArea();
    const ratio = calculateAspectRatio();
    doc.text(`\nTotal Area: ${totalArea} mm²`, 10, yOffset + 10);
    doc.text(`Aspect Ratio: ${ratio}`, 10, yOffset + 20);
    doc.save("led-wall-layout.pdf");
  };

  const convertToInches = (mm) => (mm * PX_TO_INCH).toFixed(2);

  const calculateTotalArea = () => {
    return squares.reduce((sum, sq) => sum + sq.width * sq.height, 0);
  };

  const calculateAspectRatio = () => {
    const totalWidth = squares.reduce((sum, sq) => sum + sq.width, 0);
    const totalHeight = squares.reduce((max, sq) => Math.max(max, sq.height), 0);
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(totalWidth, totalHeight);
    return `${totalWidth / divisor}:${totalHeight / divisor}`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder="Width (mm)"
          onChange={(e) => setWidth(Number(e.target.value))}
        />
        <Input
          type="number"
          placeholder="Height (mm)"
          onChange={(e) => setHeight(Number(e.target.value))}
        />
        <Button onClick={addSquare}>Add Square</Button>
        <Button onClick={exportToPDF}>Export to PDF</Button>
      </div>

      <div className="text-sm text-gray-700">
        <p>Total Area: {calculateTotalArea()} mm²</p>
        <p>Aspect Ratio: {calculateAspectRatio()}</p>
      </div>

      <div className="flex flex-wrap gap-2 border p-4 bg-gray-100 rounded" ref={containerRef}>
        {squares.map((square, index) => (
          <div
            key={index}
            style={{
              width: `${square.width * MM_TO_PX}px`,
              height: `${square.height * MM_TO_PX}px`,
              backgroundColor: "#4A90E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              position: "relative",
            }}
          >
            {square.width}mm x {square.height}mm
            <div style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              fontSize: "0.75rem",
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "0 4px",
              borderRadius: 2,
            }}>
              ({convertToInches(square.width)}" x {convertToInches(square.height)}")
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
