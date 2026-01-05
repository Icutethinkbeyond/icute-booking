
import { ColorPicker, IColor, useColor } from "react-color-palette";
import { Box, Typography, Button } from "@mui/material";
import { FieldProps } from "formik";

import React, {useEffect } from "react";

import "react-color-palette/css";
import theme from "@/utils/theme";

interface ColorPickerProps extends FieldProps {
  setFieldValue: (field: string, value: any) => void;
}

const ColorPickerCustom: React.FC<ColorPickerProps> = ({
  field,
  form: { setFieldValue },
}) => {
  
  const [color, setColor] = useColor(field.value || "#00ffff");

  // เมื่อเลือกสี → sync กลับไปที่ Formik
  useEffect(() => {
    if (color?.hex) {
      setFieldValue(field.name, color.hex);
    }
  }, [color, field.name, setFieldValue]);

  // เมื่อค่า Formik เปลี่ยน (edit mode)
  useEffect(() => {
    if (!field.value) return;

    setColor((prev) =>
      prev.hex === field.value ? prev : { ...prev, hex: field.value }
    );
  }, [field.value, setColor]);



  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, color: theme.palette.text.primary }}
      >
        สีประจำบริการ
      </Typography>
      <ColorPicker color={color} onChange={setColor} hideInput={true} hideAlpha={true}/>
    </>
  );
};

export default ColorPickerCustom;
