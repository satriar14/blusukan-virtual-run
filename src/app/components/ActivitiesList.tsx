type Props = {
  activities?: any;
};
const ActivitiesList = ({ activities }: Props) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div>
      <h2 className='text-xl font-bold mb-4'>Virtual Run Activities</h2>
      <div className='flex flex-col gap-4 justify-center items-center'>
        {activities.map((activity: any) => (
          <div
            key={activity.id}
            className='border p-4 bg-blue-300 text-gray-700 flex flex-col gap-2 w-full'
          >
            <p className='font-semibold'>{activity.name}</p>
            <p>Distance: {(activity.distance / 1000).toFixed(2)} km</p>
            <p>Time: {formatTime(activity.moving_time)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesList;
