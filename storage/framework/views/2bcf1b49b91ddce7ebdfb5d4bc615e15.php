
<?php $__env->startSection('content'); ?>
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card mx-4">
            <div class="card-body p-4">
                <h1><?php echo e(trans('panel.site_title')); ?></h1>

                <p class="text-muted"><?php echo e(trans('global.reset_password')); ?></p>

                <?php if(session('status')): ?>
                    <div class="alert alert-success" role="alert">
                        <?php echo e(session('status')); ?>

                    </div>
                <?php endif; ?>

                <form method="POST" action="<?php echo e(route('password.email')); ?>">
                    <?php echo csrf_field(); ?>

                    <div class="form-group">
                        <input id="email" type="email" class="form-control<?php echo e($errors->has('email') ? ' is-invalid' : ''); ?>" name="email" required autocomplete="email" autofocus placeholder="<?php echo e(trans('global.login_email')); ?>" value="<?php echo e(old('email')); ?>">

                        <?php if($errors->has('email')): ?>
                            <div class="invalid-feedback">
                                <?php echo e($errors->first('email')); ?>

                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary btn-flat btn-block">
                                <?php echo e(trans('global.send_password')); ?>

                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/auth/passwords/email.blade.php ENDPATH**/ ?>