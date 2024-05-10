import Product from '../../../dashboard/props/models/Product';
import { useCallback } from 'react';
import usePushRaw from '../../../dashboard/hooks/usePushRaw';
import usePushSuccess from '../../../dashboard/hooks/usePushSuccess';
import { useNavigateState } from '../../modules/state_router/Router';
import { useProductService } from '../ProductService';
import usePopNotification from '../../../dashboard/hooks/usePopNotification';

export default function useBookmarkProductToggle() {
    const pushRaw = usePushRaw();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();
    const popNotification = usePopNotification();
    const productService = useProductService();

    const showBookmarkPush = useCallback(
        (product) => {
            const media = product.photo || product.logo || null;
            const productImgSrc =
                media?.sizes?.small || media?.sizes?.thumbnail || './assets/img/placeholders/product-small.png';

            productService.list({ bookmarked: 1, per_page: 1 }).then((res) => {
                const id = pushRaw({
                    icon: null,
                    title: product.name,
                    imageSrc: productImgSrc,
                    message: `Er staan ${res.data.meta.total} aanbiedingen in het verlanglijstje`,
                    group: 'bookmarks',
                    button: {
                        icon: 'cards-heart-outline',
                        text: 'Ga naar mijn verlanglijstje',
                        onClick: () => {
                            navigateState('bookmarked-products');
                            popNotification(id);
                        },
                    },
                });
            });
        },
        [productService, pushRaw, navigateState, popNotification],
    );

    return useCallback(
        async (product: Product) => {
            product.bookmarked = !product.bookmarked;

            if (product.bookmarked) {
                return await productService.bookmark(product.id).then((res) => {
                    showBookmarkPush(product);
                    return res.data.data.bookmarked;
                });
            }

            return await productService.removeBookmark(product.id).then((res) => {
                pushSuccess(`${product.name} is verwijderd uit het verlanglijstje!`);
                return res.data.data.bookmarked;
            });
        },
        [productService, pushSuccess, showBookmarkPush],
    );
}
