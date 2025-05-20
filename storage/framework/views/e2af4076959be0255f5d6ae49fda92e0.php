<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag; ?>
<?php foreach($attributes->onlyProps(['url']) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
} ?>
<?php $attributes = $attributes->exceptProps(['url']); ?>
<?php foreach (array_filter((['url']), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
} ?>
<?php $__defined_vars = get_defined_vars(); ?>
<?php foreach ($attributes as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
} ?>
<?php unset($__defined_vars); ?>

<tr>
    <td class="header" style="text-align: center;">
        <?php if(trim($slot) === 'NONVI_VOYAGE_PLUS'): ?>
            <?php
                $path = public_path('storage/images/logo.jpg');
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = base64_encode(file_get_contents($path));
                $src = "data:image/{$type};base64,{$data}";
            ?>

            <img src="<?php echo e($src); ?>" alt="Nonvi Logo" style="width: 170px; height: 170px;">
        <?php else: ?>
            <a href="<?php echo e($url); ?>" style="display: inline-block;">
                <?php echo e($slot); ?>

            </a>
        <?php endif; ?>
    </td>
</tr>
<?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/vendor/mail/html/header.blade.php ENDPATH**/ ?>