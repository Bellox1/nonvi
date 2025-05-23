
<?php $__env->startSection('content'); ?>
<div class="content">
    <div class="row">
        <div class="col-lg-12">
            <div class="card">
               <div class="card-header">
    <?php echo e(trans('global.dashboard')); ?>

</div>

                <div class="card-body">
                    <?php if(session('status')): ?>
                        <div class="alert alert-success" role="alert">
                            <?php echo e(session('status')); ?>

                        </div>
                    <?php endif; ?>

                    <div class="row">
                        <div class="<?php echo e($settings1['column_class']); ?>">
                            <div class="card text-white bg-primary">
                                <div class="card-body pb-0">
                                    <div class="text-value"><?php echo e(number_format($settings1['total_number'])); ?></div>
                                    <div><?php echo e($settings1['chart_title']); ?></div>
                                    <br />
                                </div>
                            </div>
                        </div>
                        <div class="<?php echo e($chart2->options['column_class']); ?>">
                            <h3><?php echo $chart2->options['chart_title']; ?></h3>
                            <?php echo $chart2->renderHtml(); ?>

                        </div>
                        <div class="<?php echo e($chart3->options['column_class']); ?>">
                            <h3><?php echo $chart3->options['chart_title']; ?></h3>
                            <?php echo $chart3->renderHtml(); ?>

                        </div>
                        <div class="<?php echo e($chart4->options['column_class']); ?>">
                            <h3><?php echo $chart4->options['chart_title']; ?></h3>
                            <?php echo $chart4->renderHtml(); ?>

                        </div>
                        
                        <div class="<?php echo e($settings5['column_class']); ?>" style="overflow-x: auto;">
                            <h3><?php echo e($settings5['chart_title']); ?></h3>
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <?php $__currentLoopData = $settings5['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <th>
                                                <?php echo e(trans(sprintf('cruds.%s.fields.%s', $settings5['translation_key'] ?? 'pleaseUpdateWidget', $key))); ?>

                                            </th>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php $__empty_1 = true; $__currentLoopData = $settings5['data']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                        <tr>
                                            <?php $__currentLoopData = $settings5['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <td>
                                                    <?php if($value === ''): ?>
                                                        <?php echo e($entry->{$key}); ?>

                                                    <?php elseif(is_iterable($entry->{$key})): ?>
                                                        <?php $__currentLoopData = $entry->{$key}; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $subEentry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                            <span class="label label-info"><?php echo e($subEentry->{$value}); ?></span>
                                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                                    <?php else: ?>
                                                        <?php echo e(data_get($entry, $key . '.' . $value)); ?>

                                                    <?php endif; ?>
                                                </td>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                        <tr>
                                            <td colspan="<?php echo e(count($settings5['fields'])); ?>"><?php echo e(__('No entries found')); ?></td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>

                        
                        <div class="<?php echo e($settings6['column_class']); ?>" style="overflow-x: auto;">
                            <h3><?php echo e($settings6['chart_title']); ?></h3>
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <?php $__currentLoopData = $settings6['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <th>
                                                <?php echo e(trans(sprintf('cruds.%s.fields.%s', $settings6['translation_key'] ?? 'pleaseUpdateWidget', $key))); ?>

                                            </th>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php $__empty_1 = true; $__currentLoopData = $settings6['data']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                        <tr>
                                            <?php $__currentLoopData = $settings6['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <td>
                                                    <?php if($value === ''): ?>
                                                        <?php echo e($entry->{$key}); ?>

                                                    <?php elseif(is_iterable($entry->{$key})): ?>
                                                        <?php $__currentLoopData = $entry->{$key}; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $subEentry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                            <span class="label label-info"><?php echo e($subEentry->{$value}); ?></span>
                                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                                    <?php else: ?>
                                                        <?php echo e(data_get($entry, $key . '.' . $value)); ?>

                                                    <?php endif; ?>
                                                </td>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                        <tr>
                                            <td colspan="<?php echo e(count($settings6['fields'])); ?>"><?php echo e(__('No entries found')); ?></td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>

                        
                        <div class="<?php echo e($settings7['column_class']); ?>" style="overflow-x: auto;">
                            <h3><?php echo e($settings7['chart_title']); ?></h3>
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <?php $__currentLoopData = $settings7['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <th>
                                                <?php echo e(trans(sprintf('cruds.%s.fields.%s', $settings7['translation_key'] ?? 'pleaseUpdateWidget', $key))); ?>

                                            </th>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php $__empty_1 = true; $__currentLoopData = $settings7['data']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                        <tr>
                                            <?php $__currentLoopData = $settings7['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <td>
                                                    <?php if($value === ''): ?>
                                                        <?php echo e($entry->{$key}); ?>

                                                    <?php elseif(is_iterable($entry->{$key})): ?>
                                                        <?php $__currentLoopData = $entry->{$key}; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $subEentry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                            <span class="label label-info"><?php echo e($subEentry->{$value}); ?></span>
                                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                                    <?php else: ?>
                                                        <?php echo e(data_get($entry, $key . '.' . $value)); ?>

                                                    <?php endif; ?>
                                                </td>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                        <tr>
                                            <td colspan="<?php echo e(count($settings7['fields'])); ?>"><?php echo e(__('No entries found')); ?></td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>

                        <div class="<?php echo e($chart8->options['column_class']); ?>">
                            <h3><?php echo $chart8->options['chart_title']; ?></h3>
                            <?php echo $chart8->renderHtml(); ?>

                        </div>
                        <div class="<?php echo e($chart9->options['column_class']); ?>">
                            <h3><?php echo $chart9->options['chart_title']; ?></h3>
                            <?php echo $chart9->renderHtml(); ?>

                        </div>
                        
                        <div class="<?php echo e($settings10['column_class']); ?>" style="overflow-x: auto;">
                            <h3><?php echo e($settings10['chart_title']); ?></h3>
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <?php $__currentLoopData = $settings10['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <th>
                                                <?php echo e(trans(sprintf('cruds.%s.fields.%s', $settings10['translation_key'] ?? 'pleaseUpdateWidget', $key))); ?>

                                            </th>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php $__empty_1 = true; $__currentLoopData = $settings10['data']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                        <tr>
                                            <?php $__currentLoopData = $settings10['fields']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <td>
                                                    <?php if($value === ''): ?>
                                                        <?php echo e($entry->{$key}); ?>

                                                    <?php elseif(is_iterable($entry->{$key})): ?>
                                                        <?php $__currentLoopData = $entry->{$key}; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $subEentry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                            <span class="label label-info"><?php echo e($subEentry->{$value}); ?></span>
                                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                                    <?php else: ?>
                                                        <?php echo e(data_get($entry, $key . '.' . $value)); ?>

                                                    <?php endif; ?>
                                                </td>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                        <tr>
                                            <td colspan="<?php echo e(count($settings10['fields'])); ?>"><?php echo e(__('No entries found')); ?></td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>

                        <div class="<?php echo e($chart11->options['column_class']); ?>">
                            <h3><?php echo $chart11->options['chart_title']; ?></h3>
                            <?php echo $chart11->renderHtml(); ?>

                        </div>
                        <div class="<?php echo e($chart12->options['column_class']); ?>">
                            <h3><?php echo $chart12->options['chart_title']; ?></h3>
                            <?php echo $chart12->renderHtml(); ?>

                        </div>
                        <div class="<?php echo e($chart13->options['column_class']); ?>">
                            <h3><?php echo $chart13->options['chart_title']; ?></h3>
                            <?php echo $chart13->renderHtml(); ?>

                        </div>
                        <div class="<?php echo e($chart14->options['column_class']); ?>">
                            <h3><?php echo $chart14->options['chart_title']; ?></h3>
                            <?php echo $chart14->renderHtml(); ?>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>
<?php $__env->startSection('scripts'); ?>
<?php echo \Illuminate\View\Factory::parentPlaceholder('scripts'); ?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script><?php echo $chart2->renderJs(); ?><?php echo $chart3->renderJs(); ?><?php echo $chart4->renderJs(); ?><?php echo $chart8->renderJs(); ?><?php echo $chart9->renderJs(); ?><?php echo $chart11->renderJs(); ?><?php echo $chart12->renderJs(); ?><?php echo $chart13->renderJs(); ?><?php echo $chart14->renderJs(); ?>

<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\TOUT\nonvi\resources\views/home.blade.php ENDPATH**/ ?>