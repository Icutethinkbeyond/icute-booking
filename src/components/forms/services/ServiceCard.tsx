"use client";

import type React from "react";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
  Switch,
  Chip,
  Button,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as OfferIcon,
  MonetizationOn,
} from "@mui/icons-material";

import { Service } from "@/interfaces/Store";
import { CheckCircleIcon, Eye } from "lucide-react";
import { useState } from "react";

interface ServiceCardProps {
  service: Service;
  displayToggle?: boolean;
  displayColorOfService?: boolean;
  displayCTA?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (serviceId: string) => void;
  onEdit?: (serviceId: string) => void;
  onDelete?: (serviceId: string) => void;
  onToggleStatus?: (serviceId: string, active: boolean) => void;
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleStatus,
  displayToggle = true,
  displayColorOfService = true,
  displayCTA = true,
  selectable = false, // ค่าเริ่มต้นเป็น false
  selected = false,
  onSelect,
}: ServiceCardProps) {
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);

  const hasDetail = !!service.detail && service.detail.length > 80;

  const hasDiscount = service.discount > 0 && service.discount < service.price;
  const finalPrice = hasDiscount ? service.discount : service.price;
  const discountPercent = hasDiscount
    ? Math.round(((service.price - service.discount) / service.price) * 100)
    : 0;

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggleStatus) {
      onToggleStatus(service.id, event.target.checked);
    }
  };

const handleCardClick = () => {
    if (selectable && onSelect) {
      // สำหรับ Single Selection: ถ้ากดซ้ำรายการเดิม อาจจะให้ยกเลิก หรือไม่ทำอะไรเลยก็ได้
      // ในที่นี้คือส่ง ID ไปให้ Parent จัดการสลับค่า
      onSelect(service.id);
    }
  };

  return (
    <Card
      elevation={0}
      onClick={handleCardClick} // เพิ่ม event คลิกที่ Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        border: `2px solid ${
          selected ? theme.palette.primary.main : theme.palette.divider
        }`, // ปรับขอบให้หนาขึ้นเมื่อเลือก
        transition: "all 0.2s ease-in-out",
        position: "relative",
        cursor: selectable ? "pointer" : "default",
        opacity: service.active ? 1 : 0.65,
        backgroundColor: selected
          ? alpha(theme.palette.primary.main, 0.04)
          : theme.palette.background.paper,
        "&:hover": {
          transform: selectable ? "translateY(-4px)" : "none",
          boxShadow: selected
            ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
            : `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      {/* ส่วนบ่งชี้ว่าถูกเลือก (Checkmark Badge) */}
      {selectable && selected && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
            borderRadius: "50%",
            lineHeight: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <CheckCircleIcon style={{ fontSize: 28 }} />
        </Box>
      )}
      {/* Service Image */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={service.imageUrl || "/customer-service-interaction.png"}
          alt={service.name}
          sx={{
            objectFit: "cover",
            backgroundColor: theme.palette.grey[100],
            // เพิ่ม Filter เมื่อเลือก
            filter: selected ? "brightness(0.9)" : "none",
          }}
        />
        {/* Overlay เมื่อเลือก */}
        {selected && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              pointerEvents: 'none'
            }}
          />
        )}

        {/* {service.displayNumber > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {service.displayNumber}
          </Box>
        )} */}

        {hasDiscount && (
          <Chip
            label={`-${discountPercent}%`}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              fontWeight: 700,
              fontSize: "0.875rem",
              height: 28,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          />
        )}

        {service.colorOfService && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 8,
              backgroundColor: service.colorOfService,
              boxShadow: `0 -2px 8px ${service.colorOfService}40`,
            }}
          />
        )}
      </Box>

      {/* Card Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: selected ? theme.palette.primary.dark : theme.palette.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              flexGrow: 1,
            }}
          >
            {service.name}
          </Typography>

          {displayToggle && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Switch
                checked={
                  typeof service.active === "string"
                    ? Boolean(service.active)
                    : service.active
                }
                onChange={handleToggleChange}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.palette.success.main,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.palette.success.main,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.65rem",
                  color: service.active
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                }}
              >
                {service.active ? "เปิด" : "ปิด"}
              </Typography>
            </Box>
          )}
        </Box>

        {service.colorOfService && displayColorOfService && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: service.colorOfService,
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: `0 0 0 1px ${theme.palette.divider}`,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              สีประจำบริการ
            </Typography>
          </Box>
        )}

        {/* Service Description */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 1,
            overflow: expanded ? "visible" : "hidden",
            textOverflow: expanded ? "unset" : "ellipsis",
            display: expanded ? "block" : "-webkit-box",
            WebkitLineClamp: expanded ? "unset" : 2,
            WebkitBoxOrient: "vertical",
            minHeight: expanded ? "auto" : 40,
            transition: "all 0.2s ease",
          }}
        >
          {service.detail || "ไม่มีคำอธิบาย"}
        </Typography>

        {hasDetail && (
          <Button
            size="small"
            variant="contained"
            sx={{ p: 0, minWidth: "auto", mb: 2 }}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "ย่อ" : "อ่านต่อ"}
          </Button>
        )}

        {/* Service Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          {/* Duration */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ScheduleIcon
              sx={{ fontSize: 18, color: theme.palette.secondary.main }}
            />
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {service.durationMinutes} นาที
              {service.bufferTime > 0 && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 0.5, color: theme.palette.text.secondary }}
                >
                  (+ {service.bufferTime} นาที บัฟเฟอร์)
                </Typography>
              )}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasDiscount ? (
              <>
                <OfferIcon
                  sx={{ fontSize: 18, color: theme.palette.error.main }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.error.main,
                        fontWeight: 700,
                      }}
                    >
                      {finalPrice.toLocaleString()} บาท
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: "line-through",
                        color: theme.palette.text.disabled,
                      }}
                    >
                      {service.price.toLocaleString()} บาท
                    </Typography>
                  </Box>
                  <Chip
                    label={`ลด ${discountPercent}%`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.error.contrastText,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </>
            ) : (
              <>
                <MonetizationOn
                  sx={{ fontSize: 18, color: theme.palette.success.main }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 700,
                  }}
                >
                  {service.price.toLocaleString()} บาท
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* Staff Members */}
        {service.employees && service.employees.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: "block",
                mb: 1,
              }}
            >
              พนักงาน:
            </Typography>
            <AvatarGroup
              max={4}
              sx={{
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  fontSize: "0.875rem",
                  borderColor: theme.palette.background.paper,
                },
              }}
            >
              {service.employees.map((employee) => (
                <Tooltip key={employee.id} title={employee.name} arrow>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                    }}
                  >
                    {employee.name[0]}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}

        {/* Action Buttons */}
        {displayCTA && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              mt: "auto",
            }}
          >
            <Tooltip title="แก้ไข" arrow>
              <IconButton
                size="small"
                onClick={() => onEdit && onEdit(service.id)}
                sx={{
                  color: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}10`,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="ลบ" arrow>
              <IconButton
                size="small"
                onClick={() => onDelete && onDelete(service.id)}
                sx={{
                  color: theme.palette.error.main,
                  backgroundColor: `${theme.palette.error.main}10`,
                  "&:hover": {
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
