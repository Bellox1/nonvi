
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.create')); ?> <?php echo e(trans('cruds.coli.title_singular')); ?>

    </div>

    <div class="card-body">
        <form method="POST" action="<?php echo e(route("admin.colis.store")); ?>" enctype="multipart/form-data">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label class="required" for="destinataire_nom"><?php echo e(trans('cruds.coli.fields.destinataire_nom')); ?></label>
                <input class="form-control <?php echo e($errors->has('destinataire_nom') ? 'is-invalid' : ''); ?>" type="text" name="destinataire_nom" id="destinataire_nom" value="<?php echo e(old('destinataire_nom', '')); ?>" required>
                <?php if($errors->has('destinataire_nom')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('destinataire_nom')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.destinataire_nom_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="destinataire_tel"><?php echo e(trans('cruds.coli.fields.destinataire_tel')); ?></label>
                <input class="form-control <?php echo e($errors->has('destinataire_tel') ? 'is-invalid' : ''); ?>" type="text" name="destinataire_tel" id="destinataire_tel" value="<?php echo e(old('destinataire_tel', '')); ?>" required>
                <?php if($errors->has('destinataire_tel')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('destinataire_tel')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.destinataire_tel_helper')); ?></span>
            </div>
            <div class="form-group">
                <label for="prix"><?php echo e(trans('cruds.coli.fields.prix')); ?></label>
                <input class="form-control <?php echo e($errors->has('prix') ? 'is-invalid' : ''); ?>" type="number" name="prix" id="prix" value="<?php echo e(old('prix', '')); ?>" step="0.01">
                <?php if($errors->has('prix')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('prix')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.prix_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="heure_envoi"><?php echo e(trans('cruds.coli.fields.heure_envoi')); ?></label>
                <input class="form-control timepicker <?php echo e($errors->has('heure_envoi') ? 'is-invalid' : ''); ?>" type="text" name="heure_envoi" id="heure_envoi" value="<?php echo e(old('heure_envoi')); ?>" required>
                <?php if($errors->has('heure_envoi')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('heure_envoi')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.heure_envoi_helper')); ?></span>
            </div>
            <div class="form-group">
                <label for="heure_retrait"><?php echo e(trans('cruds.coli.fields.heure_retrait')); ?></label>
                <input class="form-control timepicker <?php echo e($errors->has('heure_retrait') ? 'is-invalid' : ''); ?>" type="text" name="heure_retrait" id="heure_retrait" value="<?php echo e(old('heure_retrait')); ?>">
                <?php if($errors->has('heure_retrait')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('heure_retrait')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.heure_retrait_helper')); ?></span>
            </div>
            <div class="form-group">
                <label><?php echo e(trans('cruds.coli.fields.statut')); ?></label>
                <select class="form-control <?php echo e($errors->has('statut') ? 'is-invalid' : ''); ?>" name="statut" id="statut">
                    <option value disabled <?php echo e(old('statut', null) === null ? 'selected' : ''); ?>><?php echo e(trans('global.pleaseSelect')); ?></option>
                    <?php $__currentLoopData = App\Models\Coli::STATUT_SELECT; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($key); ?>" <?php echo e(old('statut', 'en cours|livré') === (string) $key ? 'selected' : ''); ?>><?php echo e($label); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('statut')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('statut')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.statut_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="station_depart_id"><?php echo e(trans('cruds.coli.fields.station_depart')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('station_depart') ? 'is-invalid' : ''); ?>" name="station_depart_id" id="station_depart_id" required>
                    <?php $__currentLoopData = $station_departs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('station_depart_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('station_depart')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('station_depart')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.station_depart_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="station_arrivee_id"><?php echo e(trans('cruds.coli.fields.station_arrivee')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('station_arrivee') ? 'is-invalid' : ''); ?>" name="station_arrivee_id" id="station_arrivee_id" required>
                    <?php $__currentLoopData = $station_arrivees; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('station_arrivee_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('station_arrivee')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('station_arrivee')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.station_arrivee_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="user_id"><?php echo e(trans('cruds.coli.fields.user')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('user') ? 'is-invalid' : ''); ?>" name="user_id" id="user_id" required>
                    <?php $__currentLoopData = $users; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('user_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('user')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('user')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.user_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="expediteur_id"><?php echo e(trans('cruds.coli.fields.expediteur')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('expediteur') ? 'is-invalid' : ''); ?>" name="expediteur_id" id="expediteur_id" required>
                    <?php $__currentLoopData = $expediteurs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('expediteur_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('expediteur')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('expediteur')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.coli.fields.expediteur_helper')); ?></span>
            </div>
            <div class="form-group">
                <button class="btn btn-danger" type="submit">
                    <?php echo e(trans('global.save')); ?>

                </button>
            </div>
        </form>
    </div>
</div>



<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/colis/create.blade.php ENDPATH**/ ?>