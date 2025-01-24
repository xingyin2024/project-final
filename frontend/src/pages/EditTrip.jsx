import { useParams } from 'react-router-dom';
import TripForm from '../components/TripForm';

const EditTrip = () => {
  const { id } = useParams();

  // Render TripForm in edit mode, passing the tripId
  return <TripForm mode="edit" tripId={id} />;
};

export default EditTrip;
