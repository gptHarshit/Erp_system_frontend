import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const MyCalender = ({ selectedDate, setSelectedDate }) => {

  return (
    <div>
      <Calendar
        value={selectedDate}
        onChange={(date) => setSelectedDate(date)}
      />
    </div>
  );
};

export default MyCalender;
