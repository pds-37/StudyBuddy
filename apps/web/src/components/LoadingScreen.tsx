export default function LoadingScreen({ message = "Loading your study cockpit..." }: { message?: string }) {
  return (
    <div className="loading-screen">
      <div className="loading-orb" />
      <p>{message}</p>
    </div>
  );
}
