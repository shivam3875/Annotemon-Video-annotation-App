import { useEffect, useRef } from 'react';
import { Rect, Transformer} from 'react-konva';


const Rectangle = ({ shapeProps, isSelected, onSelect, onChange, visible }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        onClick={onSelect}
        
        ref={shapeRef}
        {...shapeProps}
        visible={visible}
        draggable
        offsetX={0}
        offsetY={0}
        onDragEnd={e => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={e => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(), // ✅ Include rotation

          });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotationEnabled={true} // ✅ Rotation handle
/>}
    </>
  );
};


export default Rectangle;