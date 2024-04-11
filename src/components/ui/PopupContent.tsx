interface Falla {
  number: string;
  name: string;
  time: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

interface PopupContentProps {
  falla: Falla;
}

export const PopupContent: React.FC<PopupContentProps> = ({ falla }) => {
  return (
    <div>
      <h3>{falla.name}</h3>
      <p>Time: {falla.time}</p>
    </div>
  );
};
