/**
 * Maps a furniture data category letter + class ID to a product-preview
 * category bucket, used by ProductIconWidget/ProductImageWidget to decide
 * whether a wall item can be previewed at all.
 *
 * AS3 class name unrecoverable: obfuscated as `_SafeCls_4273` in
 * win63_2026_crypted_version and `class_3988` in win63_version - neither tier
 * nor PRODUCTION-201601012205-226667486 has a readable name for this utility class.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/window/utils/_SafeCls_4273.as::categoryMapping()
 */
export class ProductCategoryMapping 
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/utils/_SafeCls_4273.as::categoryMapping()
    public static categoryMapping(category: string, classId: number): number 
    {
        if(category === 'S') 
        {
            return 1;
        }

        if(category === 'I') 
        {
            if(classId === 3001) return 2;
            if(classId === 3002) return 3;
            if(classId === 4057) return 4;

            return 1;
        }

        return 1;
    }

    /**
     * Creates a preview bitmap of a chat item (chat bubble style rendered with
     * sample text) for catalog/inventory product previews.
     *
     * TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/window/utils/_SafeCls_4273.as::createChatItemPreview()
     * delegates to `windowManager.freeFlowChat.createPreviewBitmap(username, styleId)`,
     * which isn't ported yet (IHabboFreeFlowChat has no createPreviewBitmap()). Always
     * returns null until that lands; callers already treat null as "can't preview this".
     */
    public static createChatItemPreview(_windowManager: unknown, _styleId: number, _username: string | null = null): ImageBitmap | null 
    {
        return null;
    }
}
