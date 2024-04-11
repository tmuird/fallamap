import { Image } from "@nextui-org/react";
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
    <>
      <h3>{falla.name}</h3>
      <p>Time: {falla.time}</p>
      <Image
        isBlurred
        className="falla-image"
        src="https://www.laprimera.es/images/blog/original/1647014852las-fallas-in-spain-1.jpg"
        alt="No image"
      />
    </>
  );
};
