<?php use App\Helpers\MarkdownHelper; ?>

<?php echo MarkdownHelper::strip($header ?? ''); ?>

<?php echo MarkdownHelper::strip($slot); ?>


<?php if(isset($subcopy)): ?>
<?php echo MarkdownHelper::strip($subcopy); ?>

<?php endif; ?>

<?php echo MarkdownHelper::strip($footer ?? ''); ?>

<?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/vendor/mail/text/layout.blade.php ENDPATH**/ ?>