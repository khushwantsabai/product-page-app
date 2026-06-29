import re

with open('app/routes/app.editor.$id.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports and SortableItem
imports = """import { useState, useEffect, useRef } from "react";
import editorStyles from "../styles/editor.css?url";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: props.id});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as any,
    zIndex: isDragging ? 1 : 0,
    width: '100%'
  };
  return (
    <div ref={setNodeRef} style={style} className="sortable-section-wrapper">
      <div {...attributes} {...listeners} style={{ position: 'absolute', top: '10px', left: '-20px', cursor: 'grab', color: '#9CA3AF', padding: '4px', zIndex: 10 }} title="Drag to reorder">⠿</div>
      {props.children}
    </div>
  );
}
"""
content = content.replace('import { useState, useEffect, useRef } from "react";\nimport editorStyles from "../styles/editor.css?url";\nimport { authenticate } from "../shopify.server";\nimport prisma from "../db.server";', imports)

# 2. sectionOrder initial state
content = content.replace(
    '  const [editorData, setEditorDataState] = useState(() => ({\n    ...initialMockData,',
    '  const [editorData, setEditorDataState] = useState(() => ({\n    ...initialMockData,\n    sectionOrder: initialMockData.sectionOrder || [\'header\', \'desc\', \'vendor\', \'options\', \'actions\', \'stock\', \'trust\'],'
)

# 3. sensors and handleDragEnd
handlers = """  const historyRef = useRef<any[]>([editorData]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    if (over && active.id !== over.id) {
      setEditorData((prev: any) => {
        const oldIndex = prev.sectionOrder.indexOf(active.id);
        const newIndex = prev.sectionOrder.indexOf(over.id);
        return {
          ...prev,
          sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex),
        };
      });
    }
  };
"""
content = content.replace('  const historyRef = useRef<any[]>([editorData]);', handlers)

# 4. Refactoring mock-details
# I will extract the individual chunks of HTML for each section from mock-details
# and then replace the mock-details children with a mapped output.

# Find the start of mock-details children
start_marker = "{/* Header Group: Title, Reviews, Price */}"
end_marker = "{/* Right Sidebar */}"

chunk = content[content.find(start_marker):content.find(end_marker)]

# Split the chunk into the specific parts using the comments
header_part = chunk[chunk.find("{/* Header Group: Title, Reviews, Price */}"):chunk.find("{/* Description Group (Only when layout is stacked or in mobile view) */}")]
desc_part = chunk[chunk.find("{/* Description Group (Only when layout is stacked or in mobile view) */}"):chunk.find("{/* Vendor Details (Only when layout is stacked or in mobile view) */}")]
vendor_part = chunk[chunk.find("{/* Vendor Details (Only when layout is stacked or in mobile view) */}"):chunk.find("{/* Options Group: Variants, Quantity */}")]
options_part = chunk[chunk.find("{/* Options Group: Variants, Quantity */}"):chunk.find("{/* Checkout Actions */}")]
actions_part = chunk[chunk.find("{/* Checkout Actions */}"):chunk.find("{/* Stock Warning */}")]
stock_part = chunk[chunk.find("{/* Stock Warning */}"):chunk.find("{/* Trust Badges (Only when layout is stacked or in mobile view) */}")]
trust_part = chunk[chunk.find("{/* Trust Badges (Only when layout is stacked or in mobile view) */}"):chunk.rfind("</div>\n            </div>")]

# We need to wrap mock-details in DndContext
dnd_context = """                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={editorData.sectionOrder || []} strategy={verticalListSortingStrategy}>
                    {(editorData.sectionOrder || []).map((sectionId: string) => {
                      if (sectionId === 'header') return <SortableItem key="header" id="header">""" + header_part + """</SortableItem>;
                      if (sectionId === 'desc') return <SortableItem key="desc" id="desc">""" + desc_part + """</SortableItem>;
                      if (sectionId === 'vendor') return <SortableItem key="vendor" id="vendor">""" + vendor_part + """</SortableItem>;
                      if (sectionId === 'options') return <SortableItem key="options" id="options">""" + options_part + """</SortableItem>;
                      if (sectionId === 'actions') return <SortableItem key="actions" id="actions">""" + actions_part + """</SortableItem>;
                      if (sectionId === 'stock') return <SortableItem key="stock" id="stock">""" + stock_part + """</SortableItem>;
                      if (sectionId === 'trust') return <SortableItem key="trust" id="trust">""" + trust_part + """</SortableItem>;
                      return null;
                    })}
                  </SortableContext>
                </DndContext>
"""

new_content = content[:content.find(start_marker)] + dnd_context + content[content.rfind("</div>\n            </div>", 0, content.find(end_marker)):]

with open('app/routes/app.editor.$id.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Editor patched successfully!")
