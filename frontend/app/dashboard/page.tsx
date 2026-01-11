import { getUserId } from "@/actions/actions";
import RoomButtons from "@/components/join-room-buttons";

export default async function page() {
  let userId: string | undefined;
  try {
    userId = (await getUserId()) as string;
  } catch (error) {
    console.log(error);
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <RoomButtons userId={userId} />
    </div>
  );
}
