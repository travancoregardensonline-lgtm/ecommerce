import Image from "next/image";
import { Droplets, Sun, Wind, Thermometer, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PlantCarePage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">Plant Care Guide</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Everything you need to know to keep your green friends happy and thriving. Basic principles for indoor plant parenthood.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
                <div>
                    <div className="sticky top-24 space-y-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Sun className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold font-heading">Light</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Light is food for plants. Understanding the lighting in your home is the first step to choosing the right plant. Let&apos;s break down the common terms:
                            </p>
                            <ul className="space-y-3 ms-4 list-disc text-muted-foreground">
                                <li><strong className="text-foreground">Bright, Indirect Light:</strong> Brightest spot in the room but without the harsh sun hitting the leaves directly (mostly South/East windows).</li>
                                <li><strong className="text-foreground">Low Light:</strong> Far from windows or North facing rooms. Few plants thrive here, but snake plants and ZZ plants can tolerate it.</li>
                                <li><strong className="text-foreground">Direct Sun:</strong> Sunlight hits the plant straight on. Succulents, cacti, and some tropicals love this.</li>
                            </ul>
                        </div>

                        <Separator />

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold font-heading">Watering</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Overwatering is the #1 killer of indoor plants. It&apos;s always better to underwater than overwater.
                            </p>
                            <ul className="space-y-3 ms-4 list-disc text-muted-foreground">
                                <li><strong className="text-foreground">The Finger Test:</strong> Stick your finger 2 inches into the soil. If it feels dry, water it. If it feels moist, wait a few days.</li>
                                <li><strong className="text-foreground">Drainage is Key:</strong> Ensure your pot has drainage holes. Plants should never sit in standing water.</li>
                                <li><strong className="text-foreground">Consistency:</strong> Tropicals prefer evenly moist soil, while succulents want to dry out completely between waterings.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-12">
                        <Image
                            src="https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=1000"
                            alt="Person watering indoor plants"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="space-y-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <Wind className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold font-heading">Humidity & Air</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Most indoor plants come from tropical environments where humidity is high. To increase humidity, you can group plants together, use a humidifier, or place them on a pebble tray with water. Avoid placing plants directly near AC vents or drafty windows.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                    <Thermometer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h2 className="text-2xl font-bold font-heading">Temperature</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                A general rule of thumb: if you&apos;re comfortable, your plant is comfortable. Ideal temperatures for most indoor plants range from 18°C to 24°C (65°F to 85°F).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center border border-primary/10">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold font-heading mb-4">The 30-Day Guarantee</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                    We stand by the health of our plants. If your plant perishes within the first 30 days despite you following our care instructions, we will replace it for free.
                </p>
            </div>

        </div>
    );
}
