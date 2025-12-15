"use client";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Chip,
  useTheme,
} from "@mui/material";
import { AccessTime, AttachMoney } from "@mui/icons-material";
import { services } from "@/utils/lib/booking-data";

interface Step1Props {
  value?: string;
  onChange?: (value: string) => void;
}

export function Step1ServiceSelection({ value, onChange }: Step1Props) {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h5"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        Select your service
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "text.secondary",
        }}
      >
        Choose the service you would like to book
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {services.map((service: any) => (
          <Card
            key={service.id}
            sx={{
              border:
                value === service.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
              backgroundColor:
                value === service.id
                  ? theme.palette.action.selected
                  : theme.palette.background.paper,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardActionArea
            // onClick={() => onChange(service.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={service.image}
                alt={service.name}
                sx={{ aspectRatio: "3/2", objectFit: "cover" }}
              />
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  {service.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {service.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    icon={<AccessTime sx={{ fontSize: 18 }} />}
                    label={`${service.duration} min`}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.grey[200],
                      color: theme.palette.text.primary,
                    }}
                  />
                  <Chip
                    icon={<AttachMoney sx={{ fontSize: 18 }} />}
                    label={`฿${service.price.toLocaleString()}`}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
