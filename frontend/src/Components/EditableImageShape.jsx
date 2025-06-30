import React, { useRef, useEffect } from "react";
import { Image, Transformer } from "react-konva";
import useImage from "../hooks/useImage";

const EditableImageShape = ({ shapeProps, isSelected, onSelect, onChange, visible  }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [img] = useImage(shapeProps.src, "anonymous");

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, img]);

  return (
    <>
      <Image
        ref={shapeRef}
        image={img}
        {...shapeProps}
        visible={visible}
        draggable
        onClick={onSelect}
        onTap={onSelect}
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
            width: Math.max(10, node.width() * scaleX),
            height: Math.max(10, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};
export default EditableImageShape;
