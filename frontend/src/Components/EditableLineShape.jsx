import { useRef } from 'react';
import {Circle, Line,} from 'react-konva';



const EditableLineShape = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();

  // Handle endpoint drag
  const handlePointDrag = (idx, e) => {
    const newPoints = shapeProps.points.slice();
    newPoints[idx * 2] = e.target.x();
    newPoints[idx * 2 + 1] = e.target.y();
    onChange({
      ...shapeProps,
      points: newPoints,
    });
  };

  return (
    <>
      {/* The main line */}
      <Line
        onClick={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable={false} // Line itself is not draggable
      />
      {/* Endpoints as draggable circles */}
      {isSelected && shapeProps.points && shapeProps.points.length === 4 && (
        <>
          {/* Start point handle */}
          <Circle
            x={shapeProps.points[0]}
            y={shapeProps.points[1]}
            radius={Math.max(6,shapeProps.strokeWidth)}
            fill={shapeProps.stroke}
            draggable
            onDragMove={e => handlePointDrag(0, e)}
            onClick={onSelect}
          />
          {/* End point handle */}
          <Circle
            x={shapeProps.points[2]}
            y={shapeProps.points[3]}
            radius={Math.max(6,shapeProps.strokeWidth)}
            fill={shapeProps.stroke}
            draggable
            onDragMove={e => handlePointDrag(1, e)}
            onClick={onSelect}
          />
        </>
      )}
    </>
  );
};


export default EditableLineShape;