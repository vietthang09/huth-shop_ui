import Image from "next/image";
import Link from "next/link";

export default function FloatingButtons() {
  return (
    <div className="fixed right-4 bottom-4 z-50 space-y-4">
      <div className="w-12 h-12 bg-white p-2 rounded-full shadow hover:shadow-xl">
        <Link href="https://fb.me" target="_blank">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/2048px-Facebook_Messenger_logo_2020.svg.png"
            alt="zalo_icon"
            width={48}
            height={48}
          />
        </Link>
      </div>
      <div className="w-12 h-12 bg-white p-2 rounded-full shadow hover:shadow-xl">
        <Link href="https://fb.me" target="_blank">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png"
            alt="zalo_icon"
            width={48}
            height={48}
          />
        </Link>
      </div>
    </div>
  );
}
