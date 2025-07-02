import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  return (
    <TimePicker
      onChange={onChange}
      value={value}
      format="hh:mm a"
      disableClock
      clearIcon={null}
      className="w-40"
      clockClassName="hidden"
    />
  );
} 