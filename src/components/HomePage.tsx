import MapComponent from "./MapComponent";
import DefaultLayout from "@/layouts/default.tsx";
import {subtitle, title} from "@/components/primitives.ts";

export default function HomePage() {
    return (
        <DefaultLayout>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="inline-block max-w-lg text-center">
                    <h1 className={title()}>
                        Welcome to <span className={title({ color: "orange" })}>Fallamap</span>.
                    </h1>
                    <h4 className={subtitle({ class: "mt-4" })}>
                        Discover Las Fallas of Valencia.
                    </h4>
                </div>

                <div className="map-container w-full max-w-4xl mx-auto my-8 aspect-video rounded-lg overflow-hidden shadow-lg">
                    <MapComponent></MapComponent>
                </div>

                <div className="mt-8">
                    {/* Additional content */}
                </div>
            </section>
        </DefaultLayout>
    );
}

