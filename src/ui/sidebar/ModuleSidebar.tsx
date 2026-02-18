import { ItemModule } from '@/ui/items/ItemModule';
import { ITEMS_CATALOG } from '@/data/items-catalog';
import { DESIGN } from '@/config/design-tokens';

export function ModuleSidebar() {
    // Group unique items by type for the palette
    // We only want one of each "blueprint"
    const blueprints = ITEMS_CATALOG.filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
    );

    const tasks = blueprints.filter((i) => i.type === 'task');
    const resources = blueprints.filter((i) => i.type === 'resource');
    const buffs = blueprints.filter((i) => i.type === 'buff');
    // Parasites are usually not manually placed, but for creative/debug mode maybe?
    // Let's exclude them for now unless requested.

    return (
        <aside className="w-64 h-full bg-[#0a0e1a] border-r border-white/10 p-4 overflow-y-auto flex flex-col gap-6 z-20">
            <h2 className="text-xl font-bold text-white tracking-tight">Modules</h2>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm uppercase text-white/50 tracking-wider">Tasks</h3>
                <div className="flex flex-wrap gap-4">
                    {tasks.map((item) => (
                        <div key={item.id} className="relative">
                            <ItemModule item={item} isSidebar />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm uppercase text-white/50 tracking-wider">Resources</h3>
                <div className="flex flex-wrap gap-4">
                    {resources.map((item) => (
                        <div key={item.id} className="relative">
                            <ItemModule item={item} isSidebar />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm uppercase text-white/50 tracking-wider">Buffs</h3>
                <div className="flex flex-wrap gap-4">
                    {buffs.map((item) => (
                        <div key={item.id} className="relative">
                            <ItemModule item={item} isSidebar />
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
