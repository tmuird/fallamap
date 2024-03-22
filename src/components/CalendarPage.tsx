import FullCalendar from "@fullcalendar/react"; // Main calendar component
import dayGridPlugin from "@fullcalendar/daygrid"; // Plugin for day grid view

// Example events
const events = [
  { title: "Event 1", date: "2024-03-22" },
  { title: "Event 2", date: "2024-03-23" },
];

const CalendarPage = () => {
  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin]} // Use the day grid plugin
        initialView="dayGridMonth" // Display the calendar in a month view initially
        events={events} // Pass events to display
        // You can add more props to customize the calendar
      />
    </div>
  );
};

export default CalendarPage;
