

export interface BookingData {
  service: string
  serviceType: "with-staff" | "without-staff"
  staff: string
  date: Date | null
  time: string
  name: string
  phone: string
  email: string
}

export interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string
  image: string
}

export interface StaffMember {
  id: string
  name: string
  role: string
  avatar?: string
}

export interface LineUser {
  userId: string
  displayName: string
  pictureUrl?: string
  email?: string
}

export const services: Service[] = [
  {
    id: "1",
    name: "Haircut",
    duration: 45,
    price: 800,
    description: "Professional haircut with styling consultation and finishing",
    image: "/professional-haircut-salon.png",
  },
  {
    id: "2",
    name: "Hair Coloring",
    duration: 120,
    price: 2500,
    description: "Full hair coloring service with premium products and color protection",
    image: "/hair-coloring-salon.png",
  },
  {
    id: "3",
    name: "Manicure",
    duration: 30,
    price: 500,
    description: "Complete nail care with polish and hand massage",
    image: "/manicure-nail-care.jpg",
  },
  {
    id: "4",
    name: "Pedicure",
    duration: 45,
    price: 650,
    description: "Relaxing foot care treatment with polish and foot massage",
    image: "/pedicure-foot-spa.jpg",
  },
  {
    id: "5",
    name: "Facial Treatment",
    duration: 60,
    price: 1200,
    description: "Deep cleansing facial with moisturizing and anti-aging treatment",
    image: "/facial-treatment-spa.png",
  },
  {
    id: "6",
    name: "Massage",
    duration: 90,
    price: 1500,
    description: "Full body therapeutic massage for relaxation and muscle relief",
    image: "/massage-therapy-spa.png",
  },
]

export const staffMembers: StaffMember[] = [
  { id: "1", name: "Sarah Johnson", role: "Senior Stylist" },
  { id: "2", name: "Michael Chen", role: "Master Colorist" },
  { id: "3", name: "Emma Williams", role: "Nail Specialist" },
  { id: "4", name: "David Martinez", role: "Massage Therapist" },
  { id: "5", name: "Lisa Anderson", role: "Esthetician" },
]

export const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]
