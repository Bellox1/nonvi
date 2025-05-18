

<?php $__env->startSection('content'); ?>
<style>
    #carteUtilisateur {
        max-width: 450px;
        min-height: 320px;
        margin: 30px auto;
        border: 2px solid #333;
        background: linear-gradient(to bottom right,rgb(0, 0, 0),rgb(0, 0, 0));
        padding: 30px;
        font-family: Arial, sans-serif;
        position: relative;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.17);
        color-adjust: exact;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    #carteUtilisateur .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    #carteUtilisateur .header h3 {
        margin: 0;
        font-size: 22px;
        color:rgb(255, 179, 0);
        font-weight: bold;
    }

    #carteUtilisateur .info {
        margin-top: 10px;
        font-size: 15px;
    }

    #carteUtilisateur .info div {
        margin-bottom: 6px;
    }

    #carteUtilisateur .header img.logo {
        height: 55px;
        margin-left: 10px;
        object-fit: contain;
    }

    #carteUtilisateur .roles {
        margin-top: 18px;
        font-size: 15px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    #carteUtilisateur .roles strong {
        margin-right: 10px;
    }

    .badge-primary {
        background-color: #1e40af;
        color: white;
        padding: 6px 10px;
        border-radius: 4px;
        margin-right: 6px;
        margin-bottom: 5px;
        display: inline-block;
    }

    #carteUtilisateur .qr-code {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 100px;
        height: 100px;
    }

    #carteUtilisateur .qr-code img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .carte-buttons {
        text-align: center;
        margin-top: 20px;
    }

    .carte-buttons button {
        background-color: #1e40af;
        color: white;
        padding: 10px 20px;
        border: none;
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    }

    .carte-buttons button:hover {
        background-color: #3b82f6;
    }

    @media print {
        body * {
            visibility: hidden;
        }

        #carteUtilisateur, #carteUtilisateur * {
            visibility: visible;
        }

        #carteUtilisateur {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            max-width: none !important;
            width: 450px !important;
            height: auto !important;
            box-shadow: none !important;
            background: linear-gradient(to bottom right,rgb(0, 0, 0),rgb(0, 0, 0)) !important;
            padding: 30px !important;
        }

        .carte-buttons {
            display: none;
        }
    }
</style>
<div class="mb-4">
    <a class="btn btn-default" href="<?php echo e(route('admin.users.show', $user->id)); ?>">
     <?php echo e(trans('global.back_to_list')); ?>

    </a>
</div>
<div id="carteUtilisateur" class="card mb-4">
    <div class="header">
        <div>
            <h3>NONVI VOYAGE PLUS</h3>
            <div class="info">
                <div><strong>Nom :</strong> <?php echo e($user->name); ?></div>
                <div><strong>Téléphone :</strong> <?php echo e($user->tel ?? 'Non défini'); ?></div>
                <div><strong>Email :</strong> <?php echo e($user->email); ?></div>
                <div><strong>Service :</strong>0120202020</div>
            </div>
        </div>
        <img src="<?php echo e(asset('storage/images/logo.jpg')); ?>" alt="Logo" class="logo">
    </div>

    <div class="roles">
        <strong>Rôle<?php echo e($user->roles->count() > 1 ? 's' : ''); ?> :</strong>
        <?php $__currentLoopData = $user->roles; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $role): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <span class="badge-primary"><?php echo e($role->title); ?></span>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </div>

    <div class="qr-code">
        <?php if(Storage::disk('public')->exists("qrcodes/{$user->id}.png")): ?>
            <img src="<?php echo e(asset("storage/qrcodes/{$user->id}.png")); ?>" alt="QR Code de <?php echo e($user->name); ?>">
        <?php else: ?>
            <span class="text-danger">QR Code manquant</span>
        <?php endif; ?>
    </div>
</div>
<div class="carte-buttons">
    <button onclick="printCarte()">
        <?php echo e(trans('cruds.user.fields.imprimer')); ?>

    </button>
    <button onclick="exportPDF()">
        <?php echo e(trans('cruds.user.fields.export_pdf')); ?>

    </button>
</div>

<div class="mb-4">
    <a class="btn btn-default" href="<?php echo e(route('admin.users.show', $user->id)); ?>">
     <?php echo e(trans('global.back_to_list')); ?>

    </a>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startSection('scripts'); ?>
<?php echo \Illuminate\View\Factory::parentPlaceholder('scripts'); ?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
    function printCarte() {
        window.print();
    }

    function exportPDF() {
        const element = document.getElementById('carteUtilisateur');
        const opt = {
            margin:       0,
            filename:     'carte_utilisateur_<?php echo e($user->id); ?>.pdf',
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 4, useCORS: true, backgroundColor: null },
            jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' },
        };

        html2pdf().set(opt).from(element).save();
    }
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/users/carte.blade.php ENDPATH**/ ?>