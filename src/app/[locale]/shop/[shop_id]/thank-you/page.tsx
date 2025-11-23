import ThankYouPage from "@/components/forms/booking/Thankyou"

export default function ThankYouRoute() {
  // Example booking details - in real app, get from query params or state
  const bookingDetails = {
    date: "15 มิถุนายน 2567",
    time: "14:00 น.",
    service: "ตัดผมและสระ",
    staff: "คุณสมชาย",
  }

  return <ThankYouPage bookingDetails={bookingDetails} lineOfficialUrl="https://line.me/R/ti/p/@yourlineofficial" />
}
