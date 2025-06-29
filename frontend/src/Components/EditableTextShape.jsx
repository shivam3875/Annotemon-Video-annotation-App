import { useEffect, useRef} from 'react';
import {Text, Transformer} from 'react-konva';



const EditableTextShape = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  // Transformer logic
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
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
          node.scaleX(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(30, node.width() * scaleX),
            rotation:node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} enabledAnchors={[]} rotateEnabled={true}/>}
    </>
  );
};


export default EditableTextShape;